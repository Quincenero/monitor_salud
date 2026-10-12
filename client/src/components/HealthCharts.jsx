import React, { useState, useMemo } from 'react';
import styles from './HealthCharts.module.css';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import { Droplets, Heart, Activity, SlidersHorizontal } from 'lucide-react';





export const HealthCharts = ({ records }) => {
  const [activeMetric, setActiveMetric] = useState('glucose');
  const [timeRange, setTimeRange] = useState('all');

  // Filter records by time range and sort chronologically (oldest to newest for charting)
  const chartData = useMemo(() => {
    if (records.length === 0) return [];

    let filtered = [...records];
    const now = new Date().getTime();

    if (timeRange === '7d') {
      filtered = filtered.filter(
        (r) => now - new Date(r.measuredAt).getTime() <= 7 * 24 * 3600 * 1000
      );
    } else if (timeRange === '14d') {
      filtered = filtered.filter(
        (r) => now - new Date(r.measuredAt).getTime() <= 14 * 24 * 3600 * 1000
      );
    } else if (timeRange === '30d') {
      filtered = filtered.filter(
        (r) => now - new Date(r.measuredAt).getTime() <= 30 * 24 * 3600 * 1000
      );
    }

    // Filtrar registros sin ningún valor
    filtered = filtered.filter(
      (r) => r.glucose != null || r.bpm != null || r.systolic != null || r.diastolic != null
    );

    // Sort ascending for chart x-axis
    filtered.sort(
      (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
    );

    return filtered.map((r) => {
      const d = new Date(r.measuredAt);
      const formattedDate = d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
      });
      const formattedTime = d.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });

      return {
        id: r.id || r._id,
        date: formattedDate,
        time: formattedTime,
        fullDate: `${formattedDate} ${formattedTime}`,
        glucose: r.glucose,
        bpm: r.bpm,
        systolic: r.systolic,
        diastolic: r.diastolic,
        context: r.context,
        notes: r.notes,
      };
    });
  }, [records, timeRange]);

  if (records.length === 0) {
    return null;
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={styles.customTooltip}>
          <div className={styles.tooltipDate}>{data.fullDate}</div>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '3px 0' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: entry.color,
                }}
              />
              <span style={{ fontSize: '0.75rem', color: '#475569' }}>{entry.name}:</span>
              <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                {entry.value} {entry.dataKey === 'glucose' ? 'mg/dL' : entry.dataKey === 'bpm' ? 'lpm' : 'mmHg'}
              </strong>
            </div>
          ))}
          {data.context && (
            <div className={styles.tooltipContext}>
              Contexto: {data.context}
            </div>
          )}
          {data.notes && (
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>
              "{data.notes}"
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chartContainer} id="health-trends-charts">
      <div className={styles.chartHeader}>
        <div className={styles.chartTitleWrap}>
          <h3>Tendencias de Monitoreo de Salud</h3>
          <p>Evolución y correlación temporal de tus mediciones</p>
        </div>

        <div className={styles.controlsWrap}>
          {/* Selector de Métrica */}
          <div className={styles.metricTabs}>
            <button
              type="button"
              className={`${styles.metricTabBtn} ${activeMetric === 'glucose' ? styles.metricTabActive : ''}`}
              onClick={() => setActiveMetric('glucose')}
            >
              <Droplets size={14} color="#0891b2" />
              <span>Glucemia</span>
            </button>
            <button
              type="button"
              className={`${styles.metricTabBtn} ${activeMetric === 'bpm' ? styles.metricTabActive : ''}`}
              onClick={() => setActiveMetric('bpm')}
            >
              <Heart size={14} color="#e11d48" />
              <span>BPM</span>
            </button>
            <button
              type="button"
              className={`${styles.metricTabBtn} ${activeMetric === 'bloodPressure' ? styles.metricTabActive : ''}`}
              onClick={() => setActiveMetric('bloodPressure')}
            >
              <Activity size={14} color="#7c3aed" />
              <span>Presión</span>
            </button>
            <button
              type="button"
              className={`${styles.metricTabBtn} ${activeMetric === 'all' ? styles.metricTabActive : ''}`}
              onClick={() => setActiveMetric('all')}
            >
              <SlidersHorizontal size={14} />
              <span>Integral</span>
            </button>
          </div>

          {/* Filtro de Rango Temporal */}
          <select
            className={styles.periodSelect}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="all">Todo el historial</option>
            <option value="30d">Últimos 30 días</option>
            <option value="14d">Últimos 14 días</option>
            <option value="7d">Últimos 7 días</option>
          </select>
        </div>
      </div>

      {/* Render Chart according to activeMetric */}
      <div className={styles.graphArea}>
        <ResponsiveContainer width="100%" height="100%">
          {activeMetric === 'glucose' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
              <YAxis domain={['dataMin - 15', 'dataMax + 20']} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={70} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'Mínimo (70)', fill: '#f97316', fontSize: 10 }} />
              <ReferenceLine y={100} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Límite ayuno (100)', fill: '#10b981', fontSize: 10 }} />
              <ReferenceLine y={140} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Límite postprandial (140)', fill: '#ef4444', fontSize: 10 }} />
              <Area
                type="monotone"
                dataKey="glucose"
                name="Glucemia"
                stroke="#0891b2"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#glucoseGradient)"
                dot={{ r: 4, fill: '#0891b2', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          ) : activeMetric === 'bpm' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="bpmGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
              <YAxis domain={['dataMin - 10', 'dataMax + 10']} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={60} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Mínimo (60 bpm)', fill: '#3b82f6', fontSize: 10 }} />
              <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Máximo reposo (100 bpm)', fill: '#ef4444', fontSize: 10 }} />
              <Area
                type="monotone"
                dataKey="bpm"
                name="Ritmo Cardíaco"
                stroke="#e11d48"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#bpmGradient)"
                dot={{ r: 4, fill: '#e11d48', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          ) : activeMetric === 'bloodPressure' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
              <YAxis domain={['dataMin - 10', 'dataMax + 15']} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={120} stroke="#9333ea" strokeDasharray="3 3" label={{ value: 'Sistólica normal (120)', fill: '#9333ea', fontSize: 10 }} />
              <ReferenceLine y={80} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Diastólica normal (80)', fill: '#3b82f6', fontSize: 10 }} />
              <Line
                type="monotone"
                dataKey="systolic"
                name="Sistólica (SYS)"
                stroke="#7c3aed"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#7c3aed', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                name="Diastólica (DIA)"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            // All combined normalized view
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
              <YAxis domain={['dataMin - 15', 'dataMax + 20']} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="glucose" name="Glucemia" stroke="#0891b2" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="bpm" name="BPM" stroke="#e11d48" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="systolic" name="Sistólica" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="diastolic" name="Diastólica" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className={styles.legendBar}>
        {activeMetric === 'glucose' && (
          <>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: '#0891b2' }} />
              <span>Glucemia (mg/dL)</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: '#10b981' }} />
              <span>Rango Óptimo en ayunas: 70 - 99 mg/dL</span>
            </div>
          </>
        )}

        {activeMetric === 'bpm' && (
          <>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: '#e11d48' }} />
              <span>Frecuencia Cardíaca (BPM)</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: '#10b981' }} />
              <span>Rango Normal en reposo: 60 - 100 lpm</span>
            </div>
          </>
        )}

        {activeMetric === 'bloodPressure' && (
          <>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: '#7c3aed' }} />
              <span>Sistólica (&lt; 120 mmHg)</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: '#3b82f6' }} />
              <span>Diastólica (&lt; 80 mmHg)</span>
            </div>
          </>
        )}

        {activeMetric === 'all' && (
          <>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: '#0891b2' }} />
              <span>Glucemia</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: '#e11d48' }} />
              <span>BPM</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: '#7c3aed' }} />
              <span>Presión Sistólica</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: '#3b82f6' }} />
              <span>Presión Diastólica</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
