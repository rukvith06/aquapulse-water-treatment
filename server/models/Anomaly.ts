import mongoose, { Schema, Document } from 'mongoose';
import { dbState, memoryDb } from '../config/db';

export interface IAnomaly extends Document {
  anomalyType: string;
  parameter: 'pH' | 'Turbidity' | 'Temperature' | 'Flow Rate' | 'Multi-parameter';
  currentValue: number;
  expectedRange: string;
  severity: 'Low' | 'Medium' | 'Critical';
  timestamp: Date;
  recommendedAction: string;
  status: 'Detected' | 'Investigating' | 'Resolved';
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
}

const AnomalySchema = new Schema<IAnomaly>(
  {
    anomalyType: { type: String, required: true },
    parameter: {
      type: String,
      enum: ['pH', 'Turbidity', 'Temperature', 'Flow Rate', 'Multi-parameter'],
      required: true,
    },
    currentValue: { type: Number, required: true },
    expectedRange: { type: String, required: true },
    severity: { type: String, enum: ['Low', 'Medium', 'Critical'], required: true },
    timestamp: { type: Date, default: Date.now, index: true },
    recommendedAction: { type: String, required: true },
    status: { type: String, enum: ['Detected', 'Investigating', 'Resolved'], default: 'Detected' },
    resolutionNotes: { type: String },
    resolvedBy: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export const MongooseAnomaly =
  mongoose.models.Anomaly || mongoose.model<IAnomaly>('Anomaly', AnomalySchema);

export const AnomalyModel = {
  async create(data: Partial<IAnomaly>) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      const doc = await MongooseAnomaly.create(data);
      return doc.toObject();
    }
    return memoryDb.anomalies.create(data);
  },

  async insertMany(items: Partial<IAnomaly>[]) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseAnomaly.insertMany(items);
    }
    return memoryDb.anomalies.insertMany(items);
  },

  async find(query: any = {}, sort: any = { timestamp: -1 }, limit: number = 50) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseAnomaly.find(query).sort(sort).limit(limit).lean();
    }
    const results = await memoryDb.anomalies.find(query);
    return results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
  },

  async findById(id: string) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseAnomaly.findById(id).lean();
    }
    return memoryDb.anomalies.findById(id);
  },

  async updateById(id: string, update: any) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseAnomaly.findByIdAndUpdate(id, update, { new: true }).lean();
    }
    return memoryDb.anomalies.findByIdAndUpdate(id, update, { new: true });
  },

  async count(query: any = {}) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseAnomaly.countDocuments(query);
    }
    return memoryDb.anomalies.countDocuments(query);
  },
};
