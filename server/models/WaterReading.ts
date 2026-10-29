import mongoose, { Schema, Document } from 'mongoose';
import { dbState, memoryDb } from '../config/db';

export interface IWaterReading extends Document {
  ph: number;
  turbidity: number;       // in NTU
  temperature: number;     // in °C
  flowRate: number;        // in m³/h
  dissolvedOxygen: number; // in mg/L
  conductivity: number;    // in µS/cm
  status: 'Normal' | 'Warning' | 'Critical';
  stage: 'Intake' | 'Coagulation' | 'Filtration' | 'Disinfection' | 'Treated Outlet';
  timestamp: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const WaterReadingSchema = new Schema<IWaterReading>(
  {
    ph: { type: Number, required: true },
    turbidity: { type: Number, required: true },
    temperature: { type: Number, required: true },
    flowRate: { type: Number, required: true },
    dissolvedOxygen: { type: Number, default: 7.2 },
    conductivity: { type: Number, default: 320 },
    status: { type: String, enum: ['Normal', 'Warning', 'Critical'], default: 'Normal' },
    stage: {
      type: String,
      enum: ['Intake', 'Coagulation', 'Filtration', 'Disinfection', 'Treated Outlet'],
      default: 'Treated Outlet',
    },
    timestamp: { type: Date, default: Date.now, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const MongooseWaterReading =
  mongoose.models.WaterReading || mongoose.model<IWaterReading>('WaterReading', WaterReadingSchema);

export const WaterReadingModel = {
  async create(data: Partial<IWaterReading>) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      const doc = await MongooseWaterReading.create(data);
      return doc.toObject();
    }
    return memoryDb.waterReadings.create(data);
  },

  async insertMany(items: Partial<IWaterReading>[]) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseWaterReading.insertMany(items);
    }
    return memoryDb.waterReadings.insertMany(items);
  },

  async findLatest(limit: number = 1) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseWaterReading.find().sort({ timestamp: -1 }).limit(limit).lean();
    }
    const all = await memoryDb.waterReadings.find();
    return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
  },

  async find(query: any = {}, sort: any = { timestamp: -1 }, limit: number = 100) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseWaterReading.find(query).sort(sort).limit(limit).lean();
    }
    const results = await memoryDb.waterReadings.find(query);
    return results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
  },

  async count(query: any = {}) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseWaterReading.countDocuments(query);
    }
    return memoryDb.waterReadings.countDocuments(query);
  },
};
