import React from 'react';
import styles from './HealthGuideModal.module.css';
import { X, BookOpen, Droplets, Heart, Activity, CheckCircle, Info } from 'lucide-react';



export const HealthGuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>
            <BookOpen size={20} color="#0d9488" />
            Guía Médica de Rangos Clínicos
          </h3>
          <button type="button" className={styles.closeBtn} onClick={onClose} title="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalContent}>
          {/* Glucemia */}
          <div className={styles.guideSection}>
            <h4 className={styles.sectionTitle}>
              <Droplets size={16} color="#0891b2" />
              1. Glucemia en Sangre (ADA - Asociación Americana de Diabetes)
            </h4>
            <table className={styles.guideTable}>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>En Ayunas (al despertar)</th>
                  <th>Postprandial (2h post comida)</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Hipoglucemia</td>
                  <td>&lt; 70 mg/dL</td>
                  <td>&lt; 70 mg/dL</td>
                  <td><span className={styles.pillDanger}>Alerta Baja</span></td>
                </tr>
                <tr>
                  <td>Normal / Saludable</td>
                  <td>70 – 99 mg/dL</td>
                  <td>&lt; 140 mg/dL</td>
                  <td><span className={styles.pillOptimal}>Óptimo</span></td>
                </tr>
                <tr>
                  <td>Prediabetes / Alterada</td>
                  <td>100 – 125 mg/dL</td>
                  <td>140 – 199 mg/dL</td>
                  <td><span className={styles.pillWarning}>Atención</span></td>
                </tr>
                <tr>
                  <td>Diabetes</td>
                  <td>≥ 126 mg/dL</td>
                  <td>≥ 200 mg/dL</td>
                  <td><span className={styles.pillDanger}>Elevado</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Ritmo cardíaco BPM */}
          <div className={styles.guideSection}>
            <h4 className={styles.sectionTitle}>
              <Heart size={16} color="#e11d48" />
              2. Frecuencia Cardíaca en Reposo (BPM / Latidos por Minuto)
            </h4>
            <table className={styles.guideTable}>
              <thead>
                <tr>
                  <th>Clasificación</th>
                  <th>Rango (lpm)</th>
                  <th>Observaciones</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Bradicardia</td>
                  <td>&lt; 60 lpm</td>
                  <td>Habitual en deportistas; en sedentarios consultar si produce mareos.</td>
                  <td><span className={styles.pillCaution}>Bajo</span></td>
                </tr>
                <tr>
                  <td>Normal en reposo</td>
                  <td>60 – 100 lpm</td>
                  <td>Frecuencia cardíaca estándar para adultos sentados o en reposo.</td>
                  <td><span className={styles.pillOptimal}>Normal</span></td>
                </tr>
                <tr>
                  <td>Taquicardia leve</td>
                  <td>101 – 120 lpm</td>
                  <td>Puede deberse a estrés, cafeína, digestión o actividad reciente.</td>
                  <td><span className={styles.pillWarning}>Cuidado</span></td>
                </tr>
                <tr>
                  <td>Taquicardia</td>
                  <td>&gt; 120 lpm</td>
                  <td>Pulsaciones altas sin esfuerzo físico justificado.</td>
                  <td><span className={styles.pillDanger}>Alto</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Presión Arterial */}
          <div className={styles.guideSection}>
            <h4 className={styles.sectionTitle}>
              <Activity size={16} color="#7c3aed" />
              3. Presión Arterial (AHA / ACC - Guías Oficiales)
            </h4>
            <table className={styles.guideTable}>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Sistólica (Alta)</th>
                  <th>Diastólica (Baja)</th>
                  <th>Nivel</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Normal</td>
                  <td>&lt; 120 mmHg</td>
                  <td>y &lt; 80 mmHg</td>
                  <td><span className={styles.pillOptimal}>Normal</span></td>
                </tr>
                <tr>
                  <td>Normal-Alta</td>
                  <td>120 – 129 mmHg</td>
                  <td>y &lt; 80 mmHg</td>
                  <td><span className={styles.pillOptimal}>Normal-Alta</span></td>
                </tr>
                <tr>
                  <td>Hipertensión Grado 1</td>
                  <td>130 – 139 mmHg</td>
                  <td>o 80 – 89 mmHg</td>
                  <td><span className={styles.pillWarning}>Grado 1</span></td>
                </tr>
                <tr>
                  <td>Hipertensión Grado 2</td>
                  <td>≥ 140 mmHg</td>
                  <td>o ≥ 90 mmHg</td>
                  <td><span className={styles.pillDanger}>Grado 2</span></td>
                </tr>
                <tr>
                  <td>Crisis Hipertensiva</td>
                  <td>&gt; 180 mmHg</td>
                  <td>y/o &gt; 120 mmHg</td>
                  <td><span className={styles.pillDanger}>Urgencia</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.disclaimerBox}>
            <strong style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
              <Info size={14} color="#0d9488" /> Recomendaciones para la toma de medidas:
            </strong>
            Reposa sentado 5 minutos antes de medir la presión y el pulso. Coloca el brazalete a la altura del corazón. Evita tomar cafeína, fumar o realizar ejercicio vigoroso 30 minutos antes. Esta herramienta es de monitoreo personal y no sustituye el diagnóstico ni el tratamiento médico formal.
          </div>
        </div>
      </div>
    </div>
  );
};
