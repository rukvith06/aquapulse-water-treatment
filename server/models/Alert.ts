import mongoose, { Schema, Document } from 'mongoose';
import { dbState, memoryDb } from '../config/db';

export interface IAlert extends Document {
  type: 'Water Quality' | 'Anomaly' | 'Equipment' | 'Chemical Dosage' | 'System';
  severity: 'Info' | 'Warning' | 'Critical';
  title: string;
  message: string;
  parameter?: string;
  value?: number;
  threshold?: string;
  timestamp: Date;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    type: {
      type: String,
      enum: ['Water Quality', 'Anomaly', 'Equipment', 'Chemical Dosage', 'System'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['Info', 'Warning', 'Critical'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    parameter: { type: String },
    value: { type: Number },
    threshold: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
    status: {
      type: String,
      enum: ['Active', 'Acknowledged', 'Resolved'],
      default: 'Active',
    },
    acknowledgedBy: { type: String },
    acknowledgedAt: { type: Date },
  },
  { timestamps: true }
);

export const MongooseAlert =
  mongoose.models.Alert || mongoose.model<IAlert>('Alert', AlertSchema);

export const AlertModel = {
  async create(data: Partial<IAlert>) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      const doc = await MongooseAlert.create(data);
      return doc.toObject();
    }
    return memoryDb.alerts.create(data);
  },

  async insertMany(items: Partial<IAlert>[]) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseAlert.insertMany(items);
    }
    return memoryDb.alerts.insertMany(items);
  },

  async find(query: any = {}, sort: any = { timestamp: -1 }, limit: number = 100) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseAlert.find(query).sort(sort).limit(limit).lean();
    }
    const results = await memoryDb.alerts.find(query);
    return results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
  },

  async findById(id: string) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseAlert.findById(id).lean();
    }
    return memoryDb.alerts.findById(id);
  },

  async updateById(id: string, update: any) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseAlert.findByIdAndUpdate(id, update, { new: true }).lean();
    }
    return memoryDb.alerts.findByIdAndUpdate(id, update, { new: true });
  },

  async count(query: any = {}) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseAlert.countDocuments(query);
    }
    return memoryDb.alerts.countDocuments(query);
  },
};
