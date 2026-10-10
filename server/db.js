import mongoose from 'mongoose';

const healthRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    glucose: { type: Number, required: true, min: 1, max: 600 },
    bpm: { type: Number, required: true, min: 1, max: 250 },
    systolic: { type: Number, required: true, min: 1, max: 260 },
    diastolic: { type: Number, required: true, min: 1, max: 160 },
    context: {
      type: String,
      enum: ['ayunas', 'postprandial', 'reposo', 'actividad', 'noche', 'otro'],
      default: 'reposo',
    },
    notes: { type: String, default: '', trim: true, maxlength: 500 },
    measuredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

healthRecordSchema.index({ userId: 1, measuredAt: -1 });

const HealthRecord =
  mongoose.models.HealthRecord ||
  mongoose.model('HealthRecord', healthRecordSchema);

// Cache global (serverless-friendly)
let cachedConnection = null;

export async function connectDatabase() {
  if (cachedConnection) return cachedConnection;
  if (mongoose.connection.readyState === 1) {
    cachedConnection = mongoose.connection;
    return cachedConnection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI no está definido en las variables de entorno.');
  }

  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
    minPoolSize: 1,
  });

  cachedConnection = conn;
  console.log(`MongoDB conectado: ${mongoose.connection.name}`);
  return conn;
}

mongoose.connection.on('disconnected', () => {
  cachedConnection = null;
});

export function getDatabaseStatus() {
  return {
    isMongoConnected: mongoose.connection.readyState === 1,
    mode: mongoose.connection.readyState === 1 ? 'mongodb' : 'disconnected',
    databaseName: mongoose.connection.name || '',
    mongoUriConfigured: Boolean(process.env.MONGODB_URI),
  };
}

function normalizeRecord(record) {
  return {
    id: record._id.toString(),
    _id: record._id.toString(),
    glucose: record.glucose,
    bpm: record.bpm,
    systolic: record.systolic,
    diastolic: record.diastolic,
    context: record.context,
    notes: record.notes,
    measuredAt: record.measuredAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function getAllRecords(userId, { limit = 200, skip = 0 } = {}) {
  const records = await HealthRecord.find({ userId })
    .sort({ measuredAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  return records.map(normalizeRecord);
}

export async function createRecord(userId, data) {
  const record = await HealthRecord.create({ userId, ...data });
  return normalizeRecord(record);
}

const UPDATABLE_FIELDS = [
  'glucose',
  'bpm',
  'systolic',
  'diastolic',
  'context',
  'notes',
  'measuredAt',
];

export async function updateRecord(userId, id, data) {
  if (!mongoose.isValidObjectId(id)) return null;

  const patch = {};
  for (const key of UPDATABLE_FIELDS) {
    if (data[key] !== undefined) patch[key] = data[key];
  }

  const updated = await HealthRecord.findOneAndUpdate(
    { _id: id, userId },
    { $set: patch },
    { returnDocument: 'after', runValidators: true }
  );

  return updated ? normalizeRecord(updated) : null;
}

export async function deleteRecord(userId, id) {
  if (!mongoose.isValidObjectId(id)) return false;
  const deleted = await HealthRecord.findOneAndDelete({ _id: id, userId });
  return Boolean(deleted);
}

export async function seedSampleRecords(userId) {
  const now = Date.now();
  const samples = [
    { glucose: 92, bpm: 68, systolic: 118, diastolic: 76, context: 'ayunas', notes: 'Despertar normal, buen descanso', measuredAt: new Date(now - 4 * 86400000) },
    { glucose: 128, bpm: 74, systolic: 122, diastolic: 79, context: 'postprandial', notes: '2 horas después del almuerzo', measuredAt: new Date(now - 4 * 86400000 + 5 * 3600000) },
    { glucose: 96, bpm: 72, systolic: 116, diastolic: 74, context: 'ayunas', notes: 'En ayunas antes del desayuno', measuredAt: new Date(now - 3 * 86400000) },
    { glucose: 135, bpm: 82, systolic: 126, diastolic: 82, context: 'postprandial', notes: 'Almuerzo con pasta', measuredAt: new Date(now - 3 * 86400000 + 6 * 3600000) },
    { glucose: 88, bpm: 65, systolic: 115, diastolic: 72, context: 'noche', notes: 'Antes de dormir en reposo', measuredAt: new Date(now - 2 * 86400000) },
    { glucose: 94, bpm: 70, systolic: 120, diastolic: 78, context: 'ayunas', notes: 'Control matutino', measuredAt: new Date(now - 86400000) },
    { glucose: 102, bpm: 86, systolic: 125, diastolic: 81, context: 'actividad', notes: 'Después de caminata de 30 min', measuredAt: new Date(now - 86400000 + 8 * 3600000) },
    { glucose: 91, bpm: 69, systolic: 117, diastolic: 75, context: 'ayunas', notes: 'Control de hoy por la mañana', measuredAt: new Date(now - 2 * 3600000) },
  ].map((s) => ({ ...s, userId }));

  const records = await HealthRecord.insertMany(samples);
  return records
    .map(normalizeRecord)
    .sort((a, b) => new Date(b.measuredAt) - new Date(a.measuredAt));
}