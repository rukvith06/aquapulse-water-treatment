import mongoose, { Schema, Document } from 'mongoose';
import { dbState, memoryDb } from '../config/db';

export interface IEquipment extends Document {
  equipmentName: string;
  code: string;
  type: 'Pump' | 'Filter' | 'Chemical Dosing' | 'Motor' | 'Sensor';
  status: 'Operational' | 'Maintenance Required' | 'Warning' | 'Offline';
  location: string;
  operatingHours: number;
  maxOperatingHours: number;
  healthScore: number; // 0 to 100
  lastMaintenance: Date;
  nextMaintenance: Date;
  maintenanceRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  maintenanceRecommendation: string;
  vibrationLevel: number; // mm/s
  motorTemperature: number; // °C
  powerConsumption: number; // kW
  createdAt: Date;
}

const EquipmentSchema = new Schema<IEquipment>(
  {
    equipmentName: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ['Pump', 'Filter', 'Chemical Dosing', 'Motor', 'Sensor'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Operational', 'Maintenance Required', 'Warning', 'Offline'],
      default: 'Operational',
    },
    location: { type: String, required: true },
    operatingHours: { type: Number, default: 0 },
    maxOperatingHours: { type: Number, default: 5000 },
    healthScore: { type: Number, default: 95 },
    lastMaintenance: { type: Date, default: Date.now },
    nextMaintenance: { type: Date, required: true },
    maintenanceRisk: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low',
    },
    maintenanceRecommendation: { type: String, required: true },
    vibrationLevel: { type: Number, default: 1.2 },
    motorTemperature: { type: Number, default: 42 },
    powerConsumption: { type: Number, default: 18.5 },
  },
  { timestamps: true }
);

export const MongooseEquipment =
  mongoose.models.Equipment || mongoose.model<IEquipment>('Equipment', EquipmentSchema);

export const EquipmentModel = {
  async create(data: Partial<IEquipment>) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      const doc = await MongooseEquipment.create(data);
      return doc.toObject();
    }
    return memoryDb.equipment.create(data);
  },

  async insertMany(items: Partial<IEquipment>[]) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseEquipment.insertMany(items);
    }
    return memoryDb.equipment.insertMany(items);
  },

  async find(query: any = {}) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseEquipment.find(query).lean();
    }
    return memoryDb.equipment.find(query);
  },

  async findById(id: string) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseEquipment.findById(id).lean();
    }
    return memoryDb.equipment.findById(id);
  },

  async findOne(query: any) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseEquipment.findOne(query).lean();
    }
    return memoryDb.equipment.findOne(query);
  },

  async updateById(id: string, update: any) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseEquipment.findByIdAndUpdate(id, update, { new: true }).lean();
    }
    return memoryDb.equipment.findByIdAndUpdate(id, update, { new: true });
  },

  async count(query: any = {}) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseEquipment.countDocuments(query);
    }
    return memoryDb.equipment.countDocuments(query);
  },
};
