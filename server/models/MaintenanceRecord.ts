import mongoose, { Schema, Document } from 'mongoose';
import { dbState, memoryDb } from '../config/db';

export interface IMaintenanceRecord extends Document {
  equipmentId: string;
  equipmentName: string;
  maintenanceType: 'Preventive' | 'Corrective' | 'Calibration' | 'Overhaul' | 'Inspection';
  description: string;
  performedBy: string;
  date: Date;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Deferred';
  partsReplaced?: string[];
  cost?: number;
  downtimeHours?: number;
  notes?: string;
  createdAt: Date;
}

const MaintenanceRecordSchema = new Schema<IMaintenanceRecord>(
  {
    equipmentId: { type: String, required: true },
    equipmentName: { type: String, required: true },
    maintenanceType: {
      type: String,
      enum: ['Preventive', 'Corrective', 'Calibration', 'Overhaul', 'Inspection'],
      required: true,
    },
    description: { type: String, required: true },
    performedBy: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Deferred'],
      default: 'Completed',
    },
    partsReplaced: [{ type: String }],
    cost: { type: Number, default: 0 },
    downtimeHours: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

export const MongooseMaintenanceRecord =
  mongoose.models.MaintenanceRecord || mongoose.model<IMaintenanceRecord>('MaintenanceRecord', MaintenanceRecordSchema);

export const MaintenanceRecordModel = {
  async create(data: Partial<IMaintenanceRecord>) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      const doc = await MongooseMaintenanceRecord.create(data);
      return doc.toObject();
    }
    return memoryDb.maintenanceRecords.create(data);
  },

  async insertMany(items: Partial<IMaintenanceRecord>[]) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseMaintenanceRecord.insertMany(items);
    }
    return memoryDb.maintenanceRecords.insertMany(items);
  },

  async find(query: any = {}, sort: any = { date: -1 }, limit: number = 50) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseMaintenanceRecord.find(query).sort(sort).limit(limit).lean();
    }
    const results = await memoryDb.maintenanceRecords.find(query);
    return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit);
  },
};
