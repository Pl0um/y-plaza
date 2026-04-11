import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import styles from './MapView.module.css';

// ── Correction du bug d'icônes Leaflet avec Vite ──────────────────────────────
// Leaflet tente de résoudre les PNGs via une URL relative qui ne fonctionne pas
// dans les bundles Vite. On redéfinit l'icône par défaut manuellement.
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ── Interface du marqueur ──────────────────────────────────────────────────────

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  titre: string;
  sousTitre?: string; // ville, prix, etc.
  lien?: string;      // URL vers la page détail
}

// ── Props du composant ────────────────────────────────────────────────────────

interface Props {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  height?: string; // ex. "400px", "60vh"
}

// Centre géographique de la France (utilisé par défaut)
const CENTRE_FRANCE: [number, number] = [46.6034, 1.8883];

export default function MapView({
  markers,
  center,
  zoom = 6,
  height = '420px',
}: Props) {
  // Si un seul marqueur et pas de centre explicite, on centre sur lui
  const mapCenter: [number, number] =
    center ??
    (markers.length === 1
      ? [markers[0].latitude, markers[0].longitude]
      : CENTRE_FRANCE);

  // Zoom automatique si un seul marqueur
  const mapZoom = center === undefined && markers.length === 1 ? 14 : zoom;

  return (
    <div className={styles.mapWrapper} style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        {/* Tuiles OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marqueurs */}
        {markers.map(m => (
          <Marker key={m.id} position={[m.latitude, m.longitude]}>
            <Popup>
              <strong>{m.titre}</strong>
              {m.sousTitre && <><br /><span>{m.sousTitre}</span></>}
              {m.lien && (
                <>
                  <br />
                  <Link to={m.lien} style={{ color: '#00B0A0', fontWeight: 500 }}>
                    Voir le détail →
                  </Link>
                </>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
