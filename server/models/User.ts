import mongoose, { Schema, Document } from 'mongoose';
import { dbState, memoryDb } from '../config/db.ts';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'Admin' | 'Operator';
  department?: string;
  shift?: string;
  avatarUrl?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Operator'], default: 'Operator' },
    department: { type: String, default: 'Water Operations' },
    shift: { type: String, default: 'Day Shift (08:00 - 16:00)' },
    avatarUrl: { type: String },
    lastLogin: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Fallback-tolerant model registration
export const MongooseUser = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export const UserModel = {
  async findOne(query: any) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseUser.findOne(query).lean();
    }
    return memoryDb.users.findOne(query);
  },

  async findById(id: string) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseUser.findById(id).lean();
    }
    return memoryDb.users.findById(id);
  },

  async create(data: Partial<IUser>) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      const doc = await MongooseUser.create(data);
      return doc.toObject();
    }
    return memoryDb.users.create(data);
  },

  async find(query: any = {}) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseUser.find(query).lean();
    }
    return memoryDb.users.find(query);
  },

  async updateById(id: string, update: any) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseUser.findByIdAndUpdate(id, update, { new: true }).lean();
    }
    return memoryDb.users.findByIdAndUpdate(id, update, { new: true });
  }
};
