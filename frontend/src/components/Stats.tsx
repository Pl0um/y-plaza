import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import styles from './Stats.module.css';

const STATS = [
  { value: 12,   suffix: '',   label: 'Agences en France' },
  { value: 350,  suffix: '+',  label: 'Biens disponibles' },
  { value: 1200, suffix: '+',  label: 'Clients satisfaits' },
  { value: 15,   suffix: ' ans', label: "D'expérience" },
];

function CountUp({ to, suffix, duration = 1600 }: { to: number; suffix: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let startTime: number | null = null;

    function tick(timestamp: number) {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * to));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [isInView, to, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Stats() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              className={styles.item}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <p className={styles.value}>
                <CountUp to={s.value} suffix={s.suffix} />
              </p>
              <p className={styles.label}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
