import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { pinIcon } from "./MapPicker";
import { formatGel, type Expense } from "@/lib/expenses";

export default function ExpenseMap({
  points,
  center,
}: {
  points: Expense[];
  center: [number, number];
}) {
  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={false}
      className="h-[420px] w-full overflow-hidden rounded-3xl"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((e) => (
        <Marker key={e.id} position={[e.lat as number, e.lng as number]} icon={pinIcon}>
          <Popup>
            <span className="text-xs font-bold">
              {formatGel(e.amountGel)}
              {e.note ? ` — ${e.note}` : ""}
            </span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
