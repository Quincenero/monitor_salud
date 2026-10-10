import React from 'react';
import styles from './HealthSummary.module.css';
import {evaluateGlucose, evaluateBpm, evaluateBloodPressure } from '../utils/healthEvaluations';
import { Droplets, Heart, Activity, ArrowUpRight, ArrowDownRight, Clock, PlusCircle } from 'lucide-react';



export const HealthSummary = ({
  records,
  onOpenNewRecord,
  onSeedSampleData,
  isSeeding = false,
}) => {
  if (records.length === 0) {
    return (
      <div className={styles.summaryGrid}>
        <div className={styles.emptyCard}>
          <Activity size={36} color="#0d9488" style={{ margin: '0 auto' }} />
          <h3 className={styles.emptyTitle}>Aún no hay mediciones registradas</h3>
          <p className={styles.emptyDesc}>
            Comienza ingresando tus valores diarios de glucemia, ritmo cardíaco (BPM) y presión arterial,
            o carga registros de demostración para explorar los gráficos y monitoreo.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={styles.statusBadge}
              style={{
                backgroundColor: '#0d9488',
                color: '#ffffff',
                padding: '0.6rem 1.25rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
                border: 'none',
              }}
              onClick={onOpenNewRecord}
            >
              <PlusCircle size={16} />
              <span>Ingresar primer registro</span>
            </button>
            <button
              type="button"
              className={styles.statusBadge}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#334155',
                padding: '0.6rem 1.25rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
                border: '1px solid #cbd5e1',
              }}
              onClick={onSeedSampleData}
              disabled={isSeeding}
            >
              <span>{isSeeding ? 'Cargando datos...' : 'Cargar datos de ejemplo'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Latest record
  const latest = records[0];

  // Averages across all records
  const avgGlucose = Math.round(records.reduce((acc, r) => acc + r.glucose, 0) / records.length);
  const avgBpm = Math.round(records.reduce((acc, r) => acc + r.bpm, 0) / records.length);
  const avgSys = Math.round(records.reduce((acc, r) => acc + r.systolic, 0) / records.length);
  const avgDia = Math.round(records.reduce((acc, r) => acc + r.diastolic, 0) / records.length);

  const glucoseEval = evaluateGlucose(latest.glucose, latest.context);
  const bpmEval = evaluateBpm(latest.bpm, latest.context);
  const bpEval = evaluateBloodPressure(latest.systolic, latest.diastolic);

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

        <div className={styles.valueRow}>
          <span className={styles.primaryValue}>{latest.glucose}</span>
          <span className={styles.unit}>mg/dL</span>
        </div>

        <div className={`${styles.statusBadge} ${getStatusClass(glucoseEval.level)}`}>
          {glucoseEval.label}
        </div>

        <div className={styles.statsFooter}>
          <span className={styles.avgLabel}>Promedio histórico:</span>
          <span className={styles.avgValue}>{avgGlucose} mg/dL</span>
        </div>
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

        <div className={styles.valueRow}>
          <span className={styles.primaryValue}>{latest.bpm}</span>
          <span className={styles.unit}>LPM (latidos/min)</span>
        </div>

        <div className={`${styles.statusBadge} ${getStatusClass(bpmEval.level)}`}>
          {bpmEval.label}
        </div>

        <div className={styles.statsFooter}>
          <span className={styles.avgLabel}>Promedio en reposo:</span>
          <span className={styles.avgValue}>{avgBpm} lpm</span>
        </div>
      </div>

      {/* Tarjeta Presión Arterial */}
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

        <div className={styles.valueRow}>
          <span className={styles.primaryValue}>
            {latest.systolic} / {latest.diastolic}
          </span>
          <span className={styles.unit}>mmHg</span>
        </div>

        <div className={`${styles.statusBadge} ${getStatusClass(bpEval.level)}`}>
          {bpEval.label}
        </div>

        <div className={styles.statsFooter}>
          <span className={styles.avgLabel}>Promedio histórico:</span>
          <span className={styles.avgValue}>{avgSys} / {avgDia} mmHg</span>
        </div>
      </div>
    </div>
  );
};
