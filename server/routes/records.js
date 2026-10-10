import { Router } from 'express';
import {
  getAllRecords,
  createRecord,
  updateRecord,
  deleteRecord,
  seedSampleRecords,
} from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

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
    const { glucose, bpm, systolic, diastolic, context, notes, measuredAt } =
      req.body;

    const values = [glucose, bpm, systolic, diastolic];
    if (
      values.some((v) => v === undefined || v === null || v === '')
    ) {
      return res.status(400).json({
        success: false,
        error:
          'Glucemia, BPM, presión sistólica y diastólica son campos requeridos.',
      });
    }

    const numbers = values.map(Number);
    if (numbers.some((v) => !Number.isFinite(v) || v <= 0)) {
      return res.status(400).json({
        success: false,
        error: 'Los valores deben ser números válidos mayores a cero.',
      });
    }

    if (numbers[2] <= numbers[3]) {
      return res.status(400).json({
        success: false,
        error: 'La presión sistólica debe ser mayor que la diastólica.',
      });
    }

    const record = await createRecord(req.user._id, {
      glucose: numbers[0],
      bpm: numbers[1],
      systolic: numbers[2],
      diastolic: numbers[3],
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
    const { glucose, bpm, systolic, diastolic } = req.body;

    // Si vienen ambos de presión, validar coherencia
    if (
      systolic !== undefined &&
      diastolic !== undefined &&
      Number(systolic) <= Number(diastolic)
    ) {
      return res.status(400).json({
        success: false,
        error: 'La presión sistólica debe ser mayor que la diastólica.',
      });
    }

    const updated = await updateRecord(req.user._id, req.params.id, req.body);
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, error: 'Registro no encontrado.' });
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
      return res
        .status(404)
        .json({ success: false, error: 'Registro no encontrado.' });
    }
    res.json({ success: true, message: 'Registro eliminado correctamente.' });
  } catch (err) {
    next(err);
  }
});

// Solo disponible en desarrollo
router.post('/seed', async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res
        .status(403)
        .json({ success: false, error: 'No disponible.' });
    }
    const records = await seedSampleRecords(req.user._id);
    res.json({ success: true, count: records.length, records });
  } catch (err) {
    next(err);
  }
});

export default router;