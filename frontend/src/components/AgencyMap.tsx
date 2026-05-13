import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './AgencyMap.module.css';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize:    [25, 41],
  iconAnchor:  [12, 41],
  popupAnchor: [1, -34],
  shadowSize:  [41, 41],
});

const AGENCES: { id: number; nom: string; ville: string; lat: number; lng: number }[] = [
  { id: 1,  nom: 'KRE Paris',           ville: 'Paris',           lat: 48.8566,  lng: 2.3522  },
  { id: 2,  nom: 'KRE Lyon',            ville: 'Lyon',            lat: 45.7640,  lng: 4.8357  },
  { id: 3,  nom: 'KRE Marseille',       ville: 'Marseille',       lat: 43.2965,  lng: 5.3698  },
  { id: 4,  nom: 'KRE Aix-en-Provence', ville: 'Aix-en-Provence', lat: 43.5297,  lng: 5.4474  },
  { id: 5,  nom: 'KRE Nice',            ville: 'Nice',            lat: 43.7102,  lng: 7.2620  },
  { id: 6,  nom: 'KRE Bordeaux',        ville: 'Bordeaux',        lat: 44.8378,  lng: -0.5792 },
  { id: 7,  nom: 'KRE Toulouse',        ville: 'Toulouse',        lat: 43.6047,  lng: 1.4442  },
  { id: 8,  nom: 'KRE Nantes',          ville: 'Nantes',          lat: 47.2184,  lng: -1.5536 },
  { id: 9,  nom: 'KRE Strasbourg',      ville: 'Strasbourg',      lat: 48.5734,  lng: 7.7521  },
  { id: 10, nom: 'KRE Lille',           ville: 'Lille',           lat: 50.6292,  lng: 3.0573  },
  { id: 11, nom: 'KRE Montpellier',     ville: 'Montpellier',     lat: 43.6108,  lng: 3.8767  },
  { id: 12, nom: 'KRE Rennes',          ville: 'Rennes',          lat: 48.1147,  lng: -1.6794 },
];

const CENTRE_FRANCE: [number, number] = [46.6, 2.2];

export default function AgencyMap() {
  return (
    <section className={styles.section}>
      <div className="container">
        <motion.div
          className={styles.mapWrap}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <MapContainer
            center={CENTRE_FRANCE}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {AGENCES.map(a => (
              <Marker key={a.id} position={[a.lat, a.lng]}>
                <Popup>
                  <strong>{a.nom}</strong>
                  <br />
                  <Link to="/agences" style={{ color: '#38573F', fontWeight: 500 }}>
                    Voir l&apos;agence &rarr;
                  </Link>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </motion.div>
      </div>
    </section>
  );
}
