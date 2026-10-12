import React, { useState, useEffect } from 'react';
import styles from './RecordForm.module.css';
import {evaluateGlucose, evaluateBpm, evaluateBloodPressure } from '../utils/healthEvaluations';
import { Activity, Heart, Droplets, CheckCircle2, AlertCircle, Calendar, FileText } from 'lucide-react';
import { api } from '../utils/api';


export const RecordForm = ({
  onRecordSaved,
  initialData,
  onCancel,
}) => {
  const toInputValue = (v) => (v === null || v === undefined ? '' : String(v));

  const [glucose, setGlucose] = useState(toInputValue(initialData?.glucose));
  const [bpm, setBpm] = useState(toInputValue(initialData?.bpm));
  const [systolic, setSystolic] = useState(toInputValue(initialData?.systolic));
  const [diastolic, setDiastolic] = useState(toInputValue(initialData?.diastolic));
  const [context, setContext] = useState(initialData?.context || 'ayunas');
  const [notes, setNotes] = useState(initialData?.notes || '');
  
  // Format datetime-local string
  const formatDateTimeLocal = (dateStr) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const [measuredAt, setMeasuredAt] = useState(formatDateTimeLocal(initialData?.measuredAt));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Parse numeric values for live feedback
  const numGlucose = glucose ? Number(glucose) : null;
  const numBpm = bpm ? Number(bpm) : null;
  const numSys = systolic ? Number(systolic) : null;
  const numDia = diastolic ? Number(diastolic) : null;

  const glucoseEval = numGlucose !== null && !isNaN(numGlucose) && numGlucose > 0 
    ? evaluateGlucose(numGlucose, context) 
    : null;

  const bpmEval = numBpm !== null && !isNaN(numBpm) && numBpm > 0 
    ? evaluateBpm(numBpm, context) 
    : null;

  const bpEval = numSys !== null && numDia !== null && !isNaN(numSys) && !isNaN(numDia) && numSys > 0 && numDia > 0 
    ? evaluateBloodPressure(numSys, numDia) 
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const parse = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
    const g = parse(glucose);
    const b = parse(bpm);
    const s = parse(systolic);
    const d = parse(diastolic);

    if (g === null && b === null && s === null && d === null) {
      setErrorMsg('Ingresá al menos un valor.');
      return;
    }
    if (g !== null && (isNaN(g) || g <= 0)) {
      setErrorMsg('Glucemia inválida.');
      return;
    }
    if (b !== null && (isNaN(b) || b <= 0)) {
      setErrorMsg('BPM inválido.');
      return;
    }
    if ((s === null) !== (d === null)) {
      setErrorMsg('Para presión arterial ingresá sistólica y diastólica juntas.');
      return;
    }
    if (s !== null && d !== null) {
      if (isNaN(s) || isNaN(d) || s <= 0 || d <= 0) {
        setErrorMsg('Valores de presión inválidos.');
        return;
      }
      if (s <= d) {
        setErrorMsg('La presión sistólica debe ser mayor a la diastólica.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const isEditing = initialData?.id || initialData?._id;
      const url = isEditing ? `/api/records/${initialData.id || initialData._id}` : '/api/records';
      const method = isEditing ? 'PUT' : 'POST';

      const data = await api(url, {
        method,
        body: {
          glucose: g,
          bpm: b,
          systolic: s,
          diastolic: d,
          context,
          notes,
          measuredAt: new Date(measuredAt).toISOString(),
        },
      });

      setSuccessMsg(isEditing ? 'Registro actualizado con éxito.' : 'Registro guardado exitosamente.');
      onRecordSaved(data.record);

      if (!isEditing) {
        setGlucose('');
        setBpm('');
        setSystolic('');
        setDiastolic('');
        setNotes('');
        setMeasuredAt(formatDateTimeLocal());
      }
    } catch (err) {
      if (err.status !== 401) {
        setErrorMsg(err.message || 'Error de conexión con el servidor');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBadgeClass = (level) => {
    switch (level) {
      case 'optimal': return styles.badgeOptimal;
      case 'caution': return styles.badgeCaution;
      case 'warning': return styles.badgeWarning;
      case 'danger': return styles.badgeDanger;
      default: return '';
    }
  };

  return (
    <div className={styles.formCard} id="health-record-form">
      <div className={styles.formHeader}>
        <div>
          <h2 className={styles.formTitle}>
            {initialData ? 'Modificar Registro de Salud' : 'Nuevo Registro de Salud'}
          </h2>
          <p className={styles.formDesc}>
            Ingresá al menos una medición. Los campos vacíos se guardan como <em>no medidos</em>.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className={`${styles.alertBox} ${styles.alertError}`}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className={`${styles.alertBox} ${styles.alertSuccess}`}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.metricsGrid}>
          {/* Glucemia */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="input-glucose">
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Droplets size={15} color="#0891b2" /> Glucemia
              </span>
              <span className={styles.labelHint}>70 - 99 mg/dL</span>
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="input-glucose"
                type="number"
                step="1"
                min="20"
                max="600"
                className={styles.inputField}
                placeholder="ej. 95"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                
              />
              <span className={styles.unitSuffix}>mg/dL</span>
            </div>
            {glucoseEval && (
              <span className={`${styles.feedbackBadge} ${getBadgeClass(glucoseEval.level)}`}>
                {glucoseEval.label}
              </span>
            )}
          </div>

          {/* Ritmo Cardíaco BPM */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel} htmlFor="input-bpm">
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Heart size={15} color="#e11d48" /> Pulso (BPM)
              </span>
              <span className={styles.labelHint}>60 - 100 lpm</span>
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="input-bpm"
                type="number"
                step="1"
                min="30"
                max="250"
                className={styles.inputField}
                placeholder="ej. 72"
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                
              />
              <span className={styles.unitSuffix}>lpm</span>
            </div>
            {bpmEval && (
              <span className={`${styles.feedbackBadge} ${getBadgeClass(bpmEval.level)}`}>
                {bpmEval.label}
              </span>
            )}
          </div>

          {/* Presión Arterial */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Activity size={15} color="#7c3aed" /> Presión Arterial
              </span>
              <span className={styles.labelHint}>&lt; 120 / 80</span>
            </label>
            <div className={styles.bpSplitGrid}>
              <div className={styles.inputWrapper}>
                <input
                  id="input-systolic"
                  type="number"
                  step="1"
                  min="50"
                  max="260"
                  className={styles.inputField}
                  placeholder="Sistólica (120)"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  title="Presión Sistólica (Alta)"
                />
                <span className={styles.unitSuffix}>SYS</span>
              </div>
              <div className={styles.inputWrapper}>
                <input
                  id="input-diastolic"
                  type="number"
                  step="1"
                  min="30"
                  max="160"
                  className={styles.inputField}
                  placeholder="Diastólica (80)"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  title="Presión Diastólica (Baja)"
                  
                />
                <span className={styles.unitSuffix}>DIA</span>
              </div>
            </div>
            {bpEval && (
              <span className={`${styles.feedbackBadge} ${getBadgeClass(bpEval.level)}`}>
                {bpEval.label}
              </span>
            )}
          </div>
        </div>

        {/* Momento de la toma / Contexto */}
        <div>
          <label className={styles.sectionLabel}>Momento o Condición de la Toma</label>
          <div className={styles.contextChips}>
            {[
              { id: 'ayunas', label: 'En ayunas (mañana)' },
              { id: 'postprandial', label: 'Postprandial (después de comer)' },
              { id: 'reposo', label: 'En reposo' },
              { id: 'actividad', label: 'Post actividad / ejercicio' },
              { id: 'noche', label: 'Antes de dormir' },
              { id: 'otro', label: 'Otro momento' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={`${styles.chipBtn} ${context === item.id ? styles.chipActive : ''}`}
                onClick={() => setContext(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fecha/Hora y Notas */}
        <div className={styles.secondaryRow}>
          <div>
            <label className={styles.sectionLabel} htmlFor="input-date">
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} /> Fecha y Hora
              </span>
            </label>
            <input
              id="input-date"
              type="datetime-local"
              className={styles.dateInput}
              value={measuredAt}
              onChange={(e) => setMeasuredAt(e.target.value)}
              required
            />
          </div>

          <div>
            <label className={styles.sectionLabel} htmlFor="input-notes">
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FileText size={14} /> Notas o Síntomas (Opcional)
              </span>
            </label>
            <textarea
              id="input-notes"
              rows={2}
              className={styles.textareaField}
              placeholder="Ej. medicación tomada, después de caminar, ligera fatiga..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className={styles.formActions}>
          {onCancel && (
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
            id="btn-save-record"
          >
            {isSubmitting ? (
              <span>Guardando...</span>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>{initialData ? 'Guardar Cambios' : 'Registrar Medición'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
