import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { fetchBiens } from '../services/api';
import type { Bien } from '../types';
import styles from './PropertyCarousel.module.css';

const PLACEHOLDER = 'https://picsum.photos/seed/fallback/1200/800';

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(n);
}

function typeFr(type: Bien['type_bien']) {
  const map: Record<Bien['type_bien'], string> = {
    appartement: 'Appartement',
    maison:      'Maison',
    bureau:      'Bureau',
    commerce:    'Commerce',
    terrain:     'Terrain',
  };
  return map[type] ?? type;
}

export default function PropertyCarousel() {
  const [biens, setBiens] = useState<Bien[]>([]);

  useEffect(() => {
    fetchBiens({ statut: 'disponible' }).then(all => {
      const shuffled = [...all].sort(() => Math.random() - 0.5);
      setBiens(shuffled.slice(0, 6));
    });
  }, []);

  if (biens.length === 0) return null;

  return (
    <section className={styles.section}>
      {/* Image de fond — élément réel, scroll avec la page */}
      <img
        src="/images/pexels-artbovich-7598378.jpg"
        alt=""
        aria-hidden="true"
        className={styles.bgImg}
      />
      <div className={styles.bgOverlay} />

      {/* Contenu au-dessus */}
      <div className={styles.inner}>
        <div className="container">
          <motion.div
            className={styles.header}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <span className={styles.eyebrow}>Sélection</span>
              <h2 className={styles.title}>Nos biens en vedette</h2>
            </div>
            <Link to="/biens" className={styles.seeAll}>
              Voir tous les biens &rarr;
            </Link>
          </motion.div>
        </div>

        <motion.div
          className={styles.swiperWrap}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 2000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            loop
            pagination={{ clickable: true }}
            slidesPerView={1}
            speed={600}
            className={styles.swiper}
          >
            {biens.map(b => {
              const photo = b.photos?.[0] ?? PLACEHOLDER;
              return (
                <SwiperSlide key={b.id}>
                  <div className={styles.card}>
                    <div className={styles.imgWrap}>
                      <img src={photo} alt={b.titre} className={styles.img} />
                    </div>
                    <div className={styles.body}>
                      <span className={styles.typeBadge}>{typeFr(b.type_bien)}</span>
                      <p className={styles.prix}>{fmt(b.prix)}</p>
                      <h3 className={styles.cardTitle}>{b.titre}</h3>
                      <div className={styles.specs}>
                        <span>{b.surface} m²</span>
                        <span className={styles.dot} />
                        <span>{b.nb_pieces} pièces</span>
                        <span className={styles.dot} />
                        <span>{b.ville}</span>
                      </div>
                      <Link to={`/biens/${b.id}`} className={styles.cardLink}>
                        Découvrir ce bien &rarr;
                      </Link>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </motion.div>
      </div>
    </section>
  );
}
