import React from 'react';
import styles from './HealthSummary.module.css';
import { evaluateGlucose, evaluateBpm, evaluateBloodPressure } from '../utils/healthEvaluations';
import { Droplets, Heart, Activity, Clock, PlusCircle } from 'lucide-react';

export const HealthSummary = ({ records, onOpenNewRecord }) => {
  if (records.length === 0) {
    return (
      <div className={styles.summaryGrid}>
        <div className={styles.emptyCard}>
          <Activity size={36} color="#0d9488" style={{ margin: '0 auto' }} />
          <h3 className={styles.emptyTitle}>Aún no hay mediciones registradas</h3>
          <p className={styles.emptyDesc}>
            Comenzá ingresando tus valores de glucemia, ritmo cardíaco (BPM) o presión arterial.
          </p>
          <button
            type="button"
            onClick={onOpenNewRecord}
            style={{
              backgroundColor: '#0d9488',
              color: '#ffffff',
              padding: '0.6rem 1.25rem',
              fontSize: '0.85rem',
              cursor: 'pointer',
              border: 'none',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginTop: '0.75rem',
            }}
          >
            <PlusCircle size={16} />
            <span>Ingresar primer registro</span>
          </button>
        </div>
      </div>
    );
  }

  const latest = records[0];

  // Promedios: solo de los registros que tienen el campo (no null)
  const avg = (key) => {
    const arr = records.map((r) => r[key]).filter((v) => v != null);
    return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
  };

  const avgGlucose = avg('glucose');
  const avgBpm = avg('bpm');
  const avgSys = avg('systolic');
  const avgDia = avg('diastolic');

  const glucoseEval = latest.glucose != null ? evaluateGlucose(latest.glucose, latest.context) : null;
  const bpmEval = latest.bpm != null ? evaluateBpm(latest.bpm, latest.context) : null;
  const bpEval =
    latest.systolic != null && latest.diastolic != null
      ? evaluateBloodPressure(latest.systolic, latest.diastolic)
      : null;

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusClass = (level) => {
    switch (level) {
      case 'optimal': return styles.statusOptimal;
      case 'caution': return styles.statusCaution;
      case 'warning': return styles.statusWarning;
      case 'danger': return styles.statusDanger;
      default: return styles.statusOptimal;
    }
  };

  return (
    <div className={styles.summaryGrid} id="health-metrics-summary">
      {/* Tarjeta Glucemia */}
      <div className={styles.metricCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleWrap}>
            <div className={`${styles.cardIcon} ${styles.iconGlucose}`}>
              <Droplets size={18} />
            </div>
            <h3 className={styles.cardTitle}>Glucemia</h3>
          </div>
          <span className={styles.timeTag}>
            <Clock size={12} style={{ display: 'inline', marginRight: 3 }} />
            {formatDate(latest.measuredAt)}
          </span>
        </div>

        {latest.glucose != null ? (
          <>
            <div className={styles.valueRow}>
              <span className={styles.primaryValue}>{latest.glucose}</span>
              <span className={styles.unit}>mg/dL</span>
            </div>
            {glucoseEval && (
              <div className={`${styles.statusBadge} ${getStatusClass(glucoseEval.level)}`}>
                {glucoseEval.label}
              </div>
            )}
            <div className={styles.statsFooter}>
              <span className={styles.avgLabel}>Promedio histórico:</span>
              <span className={styles.avgValue}>
                {avgGlucose != null ? `${avgGlucose} mg/dL` : '—'}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className={styles.valueRow}>
              <span className={styles.primaryValue} style={{ color: '#cbd5e1' }}>—</span>
            </div>
            <div className={styles.statsFooter}>
              <span className={styles.avgLabel}>Sin medición reciente</span>
              <span className={styles.avgValue}>
                {avgGlucose != null ? `${avgGlucose} mg/dL` : '—'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Tarjeta BPM */}
      <div className={styles.metricCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleWrap}>
            <div className={`${styles.cardIcon} ${styles.iconBpm}`}>
              <Heart size={18} />
            </div>
            <h3 className={styles.cardTitle}>Ritmo Cardíaco</h3>
          </div>
          <span className={styles.timeTag}>
            <Clock size={12} style={{ display: 'inline', marginRight: 3 }} />
            {formatDate(latest.measuredAt)}
          </span>
        </div>

        {latest.bpm != null ? (
          <>
            <div className={styles.valueRow}>
              <span className={styles.primaryValue}>{latest.bpm}</span>
              <span className={styles.unit}>LPM</span>
            </div>
            {bpmEval && (
              <div className={`${styles.statusBadge} ${getStatusClass(bpmEval.level)}`}>
                {bpmEval.label}
              </div>
            )}
            <div className={styles.statsFooter}>
              <span className={styles.avgLabel}>Promedio en reposo:</span>
              <span className={styles.avgValue}>
                {avgBpm != null ? `${avgBpm} lpm` : '—'}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className={styles.valueRow}>
              <span className={styles.primaryValue} style={{ color: '#cbd5e1' }}>—</span>
            </div>
            <div className={styles.statsFooter}>
              <span className={styles.avgLabel}>Sin medición reciente</span>
              <span className={styles.avgValue}>
                {avgBpm != null ? `${avgBpm} lpm` : '—'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Tarjeta Presión */}
      <div className={styles.metricCard}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleWrap}>
            <div className={`${styles.cardIcon} ${styles.iconBp}`}>
              <Activity size={18} />
            </div>
            <h3 className={styles.cardTitle}>Presión Arterial</h3>
          </div>
          <span className={styles.timeTag}>
            <Clock size={12} style={{ display: 'inline', marginRight: 3 }} />
            {formatDate(latest.measuredAt)}
          </span>
        </div>

        {latest.systolic != null && latest.diastolic != null ? (
          <>
            <div className={styles.valueRow}>
              <span className={styles.primaryValue}>
                {latest.systolic} / {latest.diastolic}
              </span>
              <span className={styles.unit}>mmHg</span>
            </div>
            {bpEval && (
              <div className={`${styles.statusBadge} ${getStatusClass(bpEval.level)}`}>
                {bpEval.label}
              </div>
            )}
            <div className={styles.statsFooter}>
              <span className={styles.avgLabel}>Promedio histórico:</span>
              <span className={styles.avgValue}>
                {avgSys != null && avgDia != null ? `${avgSys} / ${avgDia} mmHg` : '—'}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className={styles.valueRow}>
              <span className={styles.primaryValue} style={{ color: '#cbd5e1' }}>—</span>
            </div>
            <div className={styles.statsFooter}>
              <span className={styles.avgLabel}>Sin medición reciente</span>
              <span className={styles.avgValue}>
                {avgSys != null && avgDia != null ? `${avgSys} / ${avgDia} mmHg` : '—'}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};