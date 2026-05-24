import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DEPT_TO_REGION, getDeptCode } from '../utils/deptToRegion';
import styles from './FranceMap.module.css';

const REGIONS_URL = 'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/regions-version-simplifiee.geojson';
const DEPTS_URL = 'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson';

type Level = 'regions' | 'departments';

interface Props {
  items: { code_postal: string }[];
  itemLabel?: string;
  onFilterChange: (region: string | null, dept: string | null) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FlyTo({ features }: { features: any[] | null }) {
  const map = useMap();
  useEffect(() => {
    if (!features) {
      map.flyTo([46.5, 2.3], 6.5, { duration: 0.8 });
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const layer = L.geoJSON({ type: 'FeatureCollection', features } as any);
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.flyToBounds(bounds, { duration: 0.8, padding: [30, 30] });
      }
    } catch {
      /* no-op */
    }
  }, [features, map]);
  return null;
}

export default function FranceMap({ items, itemLabel = 'bien', onFilterChange }: Props) {
  const [level, setLevel] = useState<Level>('regions');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [flyFeatures, setFlyFeatures] = useState<any[] | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [regionsGeo, setRegionsGeo] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deptsGeo, setDeptsGeo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(REGIONS_URL).then(r => r.json()),
      fetch(DEPTS_URL).then(r => r.json()),
    ]).then(([regions, depts]) => {
      setRegionsGeo(regions);
      setDeptsGeo(depts);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const countByRegion = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach(item => {
      const region = DEPT_TO_REGION[getDeptCode(item.code_postal)];
      if (region) counts[region] = (counts[region] || 0) + 1;
    });
    return counts;
  }, [items]);

  const countByDept = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach(item => {
      const code = getDeptCode(item.code_postal);
      if (code) counts[code] = (counts[code] || 0) + 1;
    });
    return counts;
  }, [items]);

  const displayData = useMemo(() => {
    if (level === 'regions') return regionsGeo;
    if (!deptsGeo || !selectedRegion) return null;
    return {
      ...deptsGeo,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      features: deptsGeo.features.filter((f: any) => DEPT_TO_REGION[f.properties.code] === selectedRegion),
    };
  }, [level, selectedRegion, regionsGeo, deptsGeo]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getStyle = useCallback((feature: any) => {
    const code = feature?.properties?.code;
    const nom = feature?.properties?.nom;
    const count = level === 'regions'
      ? (countByRegion[nom] || 0)
      : (countByDept[code] || 0);
    const fillColor = count === 0 ? '#c5d4c9'
      : count < 3 ? '#8faf9a'
      : count < 8 ? '#517a5e'
      : '#38573F';
    return { fillColor, fillOpacity: 0.7, color: '#fff', weight: 1.5 };
  }, [level, countByRegion, countByDept]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEachFeature = useCallback((feature: any, layer: any) => {
    const nom = feature?.properties?.nom;
    const code = feature?.properties?.code;
    const count = level === 'regions'
      ? (countByRegion[nom] || 0)
      : (countByDept[code] || 0);
    const labelPlural = count !== 1 ? `${itemLabel}s` : itemLabel;

    layer.bindTooltip(
      `<div style="font-family:inherit;font-size:0.8rem"><strong>${nom}</strong><br/><span style="color:#38573F">${count} ${labelPlural}</span></div>`,
      { sticky: true, direction: 'top', offset: [0, -4] }
    );

    layer.on({
      mouseover: () => layer.setStyle({ fillOpacity: 0.92, weight: 2 }),
      mouseout: () => layer.setStyle({ fillOpacity: 0.7, weight: 1.5 }),
      click: () => {
        if (level === 'regions') {
          setSelectedRegion(nom);
          setLevel('departments');
          if (deptsGeo) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const regionDepts = deptsGeo.features.filter((f: any) => DEPT_TO_REGION[f.properties.code] === nom);
            setFlyFeatures(regionDepts);
          }
          onFilterChange(nom, null);
        } else {
          onFilterChange(selectedRegion, code);
        }
      },
    });
  }, [level, selectedRegion, deptsGeo, countByRegion, countByDept, itemLabel, onFilterChange]);

  const handleBack = () => {
    setLevel('regions');
    setSelectedRegion(null);
    setFlyFeatures(null);
    onFilterChange(null, null);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.overlay}>
        {level === 'departments' && (
          <button className={styles.backBtn} onClick={handleBack}>
            ← Toutes les régions
          </button>
        )}
        {selectedRegion && (
          <div className={styles.regionLabel}>{selectedRegion}</div>
        )}
        {loading && <div className={styles.loadingMsg}>Chargement de la carte…</div>}
      </div>

      <MapContainer
        center={[46.5, 2.3]}
        zoom={6.5}
        zoomSnap={0.5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={true}
        attributionControl={false}
      >
        <FlyTo features={flyFeatures} />
        {displayData && (
          <GeoJSON
            key={level === 'regions' ? `regions-${items.length}` : `depts-${selectedRegion}-${items.length}`}
            data={displayData}
            style={getStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  );
}
