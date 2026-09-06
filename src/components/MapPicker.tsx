import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
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

  return (
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
      {lat != null && lng != null && (
        <>
          <Marker position={[lat, lng]} icon={pinIcon} />
          <Recenter lat={lat} lng={lng} />
        </>
      )}
    </MapContainer>
  );
}
