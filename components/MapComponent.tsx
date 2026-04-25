"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet default icon path issue in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

const DEN_POSITION: [number, number] = [53.4186, -6.4725];

export default function MapComponent() {
  return (
    <MapContainer
      center={DEN_POSITION}
      zoom={15}
      style={{ height: "320px", width: "100%", borderRadius: "0.75rem" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={DEN_POSITION} icon={icon}>
        <Popup>
          <strong className="font-body">1st Meath Dunboyne Scout Den</strong>
          <br />
          Rooske Road, Dunboyne
          <br />
          Co. Meath, A86 NV07
        </Popup>
      </Marker>
    </MapContainer>
  );
}
