import mongoose, { Schema, Document } from 'mongoose';
import { dbState, memoryDb } from '../config/db.ts';

export interface IChatMessage extends Document {
  sender: 'user' | 'assistant' | 'system';
  text: string;
  contextData?: Record<string, any>;
  userId?: string;
  timestamp: Date;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    sender: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    text: { type: String, required: true },
    contextData: { type: Schema.Types.Mixed },
    userId: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const MongooseChatMessage =
  mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);

export const ChatMessageModel = {
  async create(data: Partial<IChatMessage>) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      const doc = await MongooseChatMessage.create(data);
      return doc.toObject();
    }
    return memoryDb.chatMessages.create(data);
  },

  async find(query: any = {}, sort: any = { timestamp: 1 }, limit: number = 100) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseChatMessage.find(query).sort(sort).limit(limit).lean();
    }
    const results = await memoryDb.chatMessages.find(query);
    return results.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).slice(0, limit);
  },

  async clear() {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseChatMessage.deleteMany({});
    }
    return memoryDb.chatMessages.clear();
  },
};
