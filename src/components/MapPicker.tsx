import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search, X } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";

/** Small teal pin drawn in CSS so no image assets are needed. */
export const pinIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:var(--primary);box-shadow:0 0 0 4px color-mix(in oklab, var(--primary) 25%, transparent)"></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function ClickCatcher({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onPick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

function Recenter({ lat, lng, zoom }: { lat: number; lng: number; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom ?? map.getZoom());
  }, [lat, lng, map, zoom]);
  return null;
}

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

async function searchNominatim(query: string, signal?: AbortSignal) {
  const params = new URLSearchParams({
    format: "jsonv2",
    limit: "5",
    q: query,
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) throw new Error("Location search failed");
  return (await response.json()) as NominatimResult[];
}

function LocationSearch({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const selectedQuery = useRef<string | null>(null);

  const selectResult = (result: NominatimResult) => {
    const lat = Number(result.lat);
    const lng = Number(result.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    selectedQuery.current = result.display_name;
    setQuery(result.display_name);
    setResults([]);
    onPick(lat, lng);
  };

  useEffect(() => {
    const value = query.trim();
    if (selectedQuery.current === value) {
      selectedQuery.current = null;
      setResults([]);
      setLoading(false);
      return;
    }
    setResults([]);
    if (value.length < 3) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      void searchNominatim(value, controller.signal)
        .then(setResults)
        .catch((error: unknown) => {
          if ((error as { name?: string }).name !== "AbortError") setResults([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const first = results[0];
    if (first) {
      selectResult(first);
      return;
    }
    const value = query.trim();
    if (value.length < 3) return;
    setLoading(true);
    void searchNominatim(value)
      .then((nextResults) => {
        if (nextResults[0]) selectResult(nextResults[0]);
        else setResults([]);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  };

  return (
    <div
      className="sticky top-0 z-30 bg-background/95 py-2 backdrop-blur"
      onClick={(event) => event.stopPropagation()}
    >
      <form onSubmit={submitSearch} className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={(event) => {
            const input = event.currentTarget;
            window.requestAnimationFrame(() => {
              input.scrollIntoView({ behavior: "smooth", block: "nearest" });
            });
          }}
          placeholder={t("searchLocationPlaceholder")}
          aria-label={t("searchLocation")}
          className="h-11 rounded-2xl border-0 bg-background/95 pl-9 pr-20 font-medium shadow-lg backdrop-blur"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />}
          {query && !loading && (
            <button
              type="button"
              aria-label={t("clearSearch")}
              onClick={() => {
                setQuery("");
                setResults([]);
              }}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </form>

      {results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-40 max-h-48 overflow-y-auto rounded-2xl border bg-card shadow-lg">
          {results.map((result) => (
            <button
              key={result.place_id}
              type="button"
              onClick={() => selectResult(result)}
              className="flex w-full items-start gap-2 border-b px-3 py-2.5 text-left text-sm last:border-0 hover:bg-secondary"
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span className="line-clamp-2 font-medium">{result.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MapPicker({
  lat,
  lng,
  onPick,
}: {
  lat: number | null;
  lng: number | null;
  onPick: (lat: number, lng: number) => void;
}) {
  const [center] = useState<[number, number]>([lat ?? 41.7151, lng ?? 44.8271]);
  const [searchCenter, setSearchCenter] = useState<{ lat: number; lng: number } | null>(null);

  return (
    <div className="relative overflow-visible">
      <LocationSearch
        onPick={(nextLat, nextLng) => {
          setSearchCenter({ lat: nextLat, lng: nextLng });
          onPick(nextLat, nextLng);
        }}
      />
      <MapContainer
        center={center}
        zoom={lat != null ? 9 : 5}
        scrollWheelZoom={false}
        className="h-52 w-full overflow-hidden rounded-2xl"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickCatcher onPick={onPick} />
        {searchCenter && <Recenter lat={searchCenter.lat} lng={searchCenter.lng} zoom={15} />}
        {lat != null && lng != null && (
          <>
            <Marker position={[lat, lng]} icon={pinIcon} />
            <Recenter lat={lat} lng={lng} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
