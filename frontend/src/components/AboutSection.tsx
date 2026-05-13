import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './AboutSection.module.css';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({
  iconUrl, iconRetinaUrl, shadowUrl,
  iconSize: [25, 41], iconAnchor: [12, 41],
  popupAnchor: [1, -34], shadowSize: [41, 41],
});

const AGENCES: { id: number; nom: string; lat: number; lng: number }[] = [
  { id: 1,  nom: 'KRE Paris',           lat: 48.8566,  lng: 2.3522  },
  { id: 2,  nom: 'KRE Lyon',            lat: 45.7640,  lng: 4.8357  },
  { id: 3,  nom: 'KRE Marseille',       lat: 43.2965,  lng: 5.3698  },
  { id: 4,  nom: 'KRE Aix-en-Provence', lat: 43.5297,  lng: 5.4474  },
  { id: 5,  nom: 'KRE Nice',            lat: 43.7102,  lng: 7.2620  },
  { id: 6,  nom: 'KRE Bordeaux',        lat: 44.8378,  lng: -0.5792 },
  { id: 7,  nom: 'KRE Toulouse',        lat: 43.6047,  lng: 1.4442  },
  { id: 8,  nom: 'KRE Nantes',          lat: 47.2184,  lng: -1.5536 },
  { id: 9,  nom: 'KRE Strasbourg',      lat: 48.5734,  lng: 7.7521  },
  { id: 10, nom: 'KRE Lille',           lat: 50.6292,  lng: 3.0573  },
  { id: 11, nom: 'KRE Montpellier',     lat: 43.6108,  lng: 3.8767  },
  { id: 12, nom: 'KRE Rennes',          lat: 48.1147,  lng: -1.6794 },
];

const CENTRE_FRANCE: [number, number] = [46.6, 2.2];

export default function AboutSection() {
  return (
    <section className={styles.section}>
      {/* Image de fond légèrement floutée */}
      <img
        src="/images/pexels-salmansaqib-28456460.jpg"
        alt=""
        aria-hidden="true"
        className={styles.bgImg}
      />
      {/* Voile sombre pour lisibilité */}
      <div className={styles.overlay} />

      <div className="container">
        <div className={styles.grid}>
          {/* Colonne texte */}
          <motion.div
            className={styles.box}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <span className={styles.eyebrow}>Fondée en 2001 · Aix-en-Provence</span>

            <h2 className={styles.title}>
              Vingt ans d&apos;expertise<br />
              <em>à votre service</em>
            </h2>

            <p className={styles.text}>
              KreAgency est née d&apos;une conviction simple : l&apos;immobilier est avant tout
              une affaire de confiance. Depuis nos débuts dans le Cours Mirabeau, nous avons
              accompagné des milliers de familles, d&apos;investisseurs et d&apos;entrepreneurs
              dans leurs projets de vie — une promesse renouvelée chaque jour à travers
              nos 12 agences réparties sur tout le territoire français.
            </p>

            <p className={styles.text}>
              Chaque bien que nous proposons est sélectionné avec soin. Chaque client
              est reçu comme un partenaire. Notre réseau d&apos;experts locaux conjugue
              connaissance du terrain et exigence du détail pour vous offrir une
              expérience immobilière sans compromis.
            </p>

            <div className={styles.actions}>
              <Link to="/agences" className={styles.btnPrimary}>
                Découvrir nos agences
              </Link>
              <Link to="/biens" className={styles.btnGhost}>
                Voir nos biens
              </Link>
            </div>
          </motion.div>

          {/* Colonne carte */}
          <motion.div
            className={styles.mapWrap}
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <MapContainer
              center={CENTRE_FRANCE}
              zoom={5}
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
                    <strong>{a.nom}</strong><br />
                    <Link to="/agences" style={{ color: '#38573F', fontWeight: 500 }}>
                      Voir l&apos;agence &rarr;
                    </Link>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
