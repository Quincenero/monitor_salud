// Evaluación clínica de Glucemia (según guías ADA)
export function evaluateGlucose(val, context = 'ayunas') {
  if (val < 70) {
    return {
      level: 'danger',
      label: 'Hipoglucemia (< 70 mg/dL)',
      description: 'Nivel bajo de azúcar en sangre. Se recomienda consumir carbohidratos rápidos.',
      badgeClass: 'danger',
    };
  }

  if (context === 'postprandial') {
    if (val <= 140) {
      return {
        level: 'optimal',
        label: 'Normal Postprandial (≤ 140 mg/dL)',
        description: 'Glucemia esperada 2 horas después de comer.',
        badgeClass: 'optimal',
      };
    } else if (val <= 199) {
      return {
        level: 'warning',
        label: 'Elevada Postprandial (141-199 mg/dL)',
        description: 'Tolerancia a la glucosa alterada. Monitorear ingesta de carbohidratos.',
        badgeClass: 'warning',
      };
    } else {
      return {
        level: 'danger',
        label: 'Hiperglucemia (≥ 200 mg/dL)',
        description: 'Nivel marcadamente alto post comida.',
        badgeClass: 'danger',
      };
    }
  }

  // Default: Ayunas / Reposo
  if (val <= 99) {
    return {
      level: 'optimal',
      label: 'Glucemia Normal (70-99 mg/dL)',
      description: 'Nivel óptimo y saludable en ayunas.',
      badgeClass: 'optimal',
    };
  } else if (val <= 125) {
    return {
      level: 'warning',
      label: 'Glucemia Alterada (100-125 mg/dL)',
      description: 'Nivel en rango de prediabetes en ayunas. Conviene consulta médica preventiva.',
      badgeClass: 'warning',
    };
  } else {
    return {
      level: 'danger',
      label: 'Glucemia Alta (≥ 126 mg/dL)',
      description: 'Rango de alerta para diabetes en ayunas. Consultar al profesional de salud.',
      badgeClass: 'danger',
    };
  }
}

// Evaluación clínica de Frecuencia Cardíaca (BPM)
export function evaluateBpm(bpm, context = 'reposo') {
  if (bpm < 50) {
    return {
      level: 'warning',
      label: 'Bradicardia Marcada (< 50 BPM)',
      description: 'Frecuencia cardíaca muy baja en reposo (común solo en atletas de alto rendimiento).',
      badgeClass: 'warning',
    };
  } else if (bpm < 60) {
    return {
      level: 'caution',
      label: 'Bradicardia Leve (50-59 BPM)',
      description: 'Frecuencia ligeramente baja.',
      badgeClass: 'caution',
    };
  } else if (bpm <= 100) {
    return {
      level: 'optimal',
      label: 'Frecuencia Normal (60-100 BPM)',
      description: 'Ritmo cardíaco dentro de parámetros recomendados en reposo.',
      badgeClass: 'optimal',
    };
  } else if (bpm <= 120) {
    return {
      level: 'caution',
      label: 'Taquicardia Leve (101-120 BPM)',
      description: 'Pulsaciones aceleradas. Comprobar si fue por esfuerzo o estrés reciente.',
      badgeClass: 'caution',
    };
  } else {
    return {
      level: 'danger',
      label: 'Taquicardia (> 120 BPM en reposo)',
      description: 'Pulsaciones significativamente altas en reposo.',
      badgeClass: 'danger',
    };
  }
}

// Evaluación clínica de Presión Arterial (AHA / ACC)
export function evaluateBloodPressure(systolic, diastolic) {
  if (systolic >= 180 || diastolic >= 120) {
    return {
      level: 'danger',
      label: 'Crisis Hipertensiva (>180 / >120)',
      description: 'Valores críticos. Si se asocia a dolor torácico o mareo, requiere atención urgente.',
      badgeClass: 'danger',
    };
  } else if (systolic >= 140 || diastolic >= 90) {
    return {
      level: 'danger',
      label: 'Hipertensión Grado 2 (≥140 / ≥90)',
      description: 'Presión arterial alta. Requiere supervisión médica regular.',
      badgeClass: 'danger',
    };
  } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return {
      level: 'warning',
      label: 'Hipertensión Grado 1 (130-139 / 80-89)',
      description: 'Presión arterial en nivel límite superior.',
      badgeClass: 'warning',
    };
  } else if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return {
      level: 'optimal',
      label: 'Presión Normal - Alta (120-129 / <80)',
      description: 'Ligeramente por encima del óptimo, pero aún en rango saludable.',
      badgeClass: 'optimal',
    };
  } else if (systolic < 90 || diastolic < 60) {
    return {
      level: 'caution',
      label: 'Hipotensión (<90 / <60)',
      description: 'Presión arterial baja. Estar atento a mareos o debilidad.',
      badgeClass: 'caution',
    };
  } else {
    return {
      level: 'optimal',
      label: 'Presión Normal (<120 / <80)',
      description: 'Valores arteriales ideales para la salud cardiovascular.',
      badgeClass: 'optimal',
    };
  }
}

