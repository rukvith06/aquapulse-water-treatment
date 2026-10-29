import mongoose, { Schema, Document } from 'mongoose';
import { dbState, memoryDb } from '../config/db.ts';

export interface IChemicalDosage extends Document {
  chemicalName: string; // e.g., 'Alum Coagulant', 'Sodium Hypochlorite (Chlorine)', 'Soda Ash', 'Polymer Flocculant'
  category: 'Coagulation' | 'Disinfection' | 'pH Correction' | 'Flocculation';
  currentDosage: number; // in mg/L or ppm
  recommendedDosage: number;
  difference: number;
  unit: string;
  reason: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  status: 'Optimal' | 'Adjustment Recommended' | 'Critical Adjustment' | 'Applied';
  waterConditions: {
    ph: number;
    turbidity: number;
    temperature: number;
    flowRate: number;
  };
  aiGenerated: boolean;
  timestamp: Date;
  appliedBy?: string;
  createdAt: Date;
}

const ChemicalDosageSchema = new Schema<IChemicalDosage>(
  {
    chemicalName: { type: String, required: true },
    category: {
      type: String,
      enum: ['Coagulation', 'Disinfection', 'pH Correction', 'Flocculation'],
      default: 'Coagulation',
    },
    currentDosage: { type: Number, required: true },
    recommendedDosage: { type: Number, required: true },
    difference: { type: Number, required: true },
    unit: { type: String, default: 'mg/L' },
    reason: { type: String, required: true },
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    status: {
      type: String,
      enum: ['Optimal', 'Adjustment Recommended', 'Critical Adjustment', 'Applied'],
      default: 'Optimal',
    },
    waterConditions: {
      ph: { type: Number, required: true },
      turbidity: { type: Number, required: true },
      temperature: { type: Number, required: true },
      flowRate: { type: Number, required: true },
    },
    aiGenerated: { type: Boolean, default: true },
    timestamp: { type: Date, default: Date.now },
    appliedBy: { type: String },
  },
  { timestamps: true }
);

export const MongooseChemicalDosage =
  mongoose.models.ChemicalDosage || mongoose.model<IChemicalDosage>('ChemicalDosage', ChemicalDosageSchema);

export const ChemicalDosageModel = {
  async create(data: Partial<IChemicalDosage>) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      const doc = await MongooseChemicalDosage.create(data);
      return doc.toObject();
    }
    return memoryDb.chemicalDosages.create(data);
  },

  async insertMany(items: Partial<IChemicalDosage>[]) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseChemicalDosage.insertMany(items);
    }
    return memoryDb.chemicalDosages.insertMany(items);
  },

  async find(query: any = {}, sort: any = { timestamp: -1 }, limit: number = 50) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseChemicalDosage.find(query).sort(sort).limit(limit).lean();
    }
    const results = await memoryDb.chemicalDosages.find(query);
    return results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
  },

  async findLatest() {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseChemicalDosage.find().sort({ timestamp: -1 }).limit(10).lean();
    }
    const all = await memoryDb.chemicalDosages.find();
    return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
  },

  async updateById(id: string, update: any) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseChemicalDosage.findByIdAndUpdate(id, update, { new: true }).lean();
    }
    return memoryDb.chemicalDosages.findByIdAndUpdate(id, update, { new: true });
  },
};
