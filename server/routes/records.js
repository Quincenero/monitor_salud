import { Router } from 'express';
import {
  getAllRecords,
  createRecord,
  updateRecord,
  deleteRecord,
} from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

function parseOptionalNumber(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Valida el payload de un registro.
 * Reglas:
 * - Al menos un valor (glucosa, bpm, sistólica, diastólica).
 * - Presión: sistólica y diastólica juntas o ninguna.
 * - Rangos válidos para cada campo presente.
 * Retorna { ok: true, data } o { ok: false, error, field }.
 */
function validateRecordPayload(body) {
  const g = parseOptionalNumber(body.glucose);
  const b = parseOptionalNumber(body.bpm);
  const s = parseOptionalNumber(body.systolic);
  const d = parseOptionalNumber(body.diastolic);

  if (g === null && b === null && s === null && d === null) {
    return {
      ok: false,
      error: 'Ingresá al menos un valor (glucemia, BPM o presión arterial).',
    };
  }

  if (g !== null && (isNaN(g) || g < 1 || g > 600)) {
    return { ok: false, error: 'Glucemia inválida (1-600 mg/dL).', field: 'glucose' };
  }

  if (b !== null && (isNaN(b) || b < 1 || b > 250)) {
    return { ok: false, error: 'BPM inválido (1-250 lpm).', field: 'bpm' };
  }

  if ((s === null) !== (d === null)) {
    return {
      ok: false,
      error: 'Para presión arterial ingresá sistólica y diastólica juntas.',
    };
  }

  if (s !== null && (isNaN(s) || s < 1 || s > 260)) {
    return { ok: false, error: 'Presión sistólica inválida (1-260 mmHg).', field: 'systolic' };
  }
  if (d !== null && (isNaN(d) || d < 1 || d > 160)) {
    return { ok: false, error: 'Presión diastólica inválida (1-160 mmHg).', field: 'diastolic' };
  }

  if (s !== null && d !== null && s <= d) {
    return {
      ok: false,
      error: 'La presión sistólica debe ser mayor que la diastólica.',
      field: 'systolic',
    };
  }

  return { ok: true, data: { g, b, s, d } };
}

router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 200, 500);
    const skip = Math.max(Number(req.query.skip) || 0, 0);
    const records = await getAllRecords(req.user._id, { limit, skip });
    res.json({ success: true, records });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const validation = validateRecordPayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, error: validation.error, field: validation.field });
    }

    const { g, b, s, d } = validation.data;
    const { context, notes, measuredAt } = req.body;

    const record = await createRecord(req.user._id, {
      glucose: g,
      bpm: b,
      systolic: s,
      diastolic: d,
      context: context || 'reposo',
      notes: notes || '',
      measuredAt: measuredAt ? new Date(measuredAt) : new Date(),
    });

    res.status(201).json({ success: true, record });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const validation = validateRecordPayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, error: validation.error, field: validation.field });
    }

    const { g, b, s, d } = validation.data;
    const { context, notes, measuredAt } = req.body;

    const updated = await updateRecord(req.user._id, req.params.id, {
      glucose: g,
      bpm: b,
      systolic: s,
      diastolic: d,
      ...(context !== undefined && { context }),
      ...(notes !== undefined && { notes }),
      ...(measuredAt !== undefined && { measuredAt: new Date(measuredAt) }),
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Registro no encontrado.' });
    }

    res.json({ success: true, record: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await deleteRecord(req.user._id, req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Registro no encontrado.' });
    }
    res.json({ success: true, message: 'Registro eliminado correctamente.' });
  } catch (err) {
    next(err);
  }
});

export default router;