import mongoose from 'mongoose';

// High-reliability database manager for MERN stack
// Connects to MongoDB Atlas / Local MongoDB if MONGO_URI is set,
// or falls back to an embedded in-memory simulated MongoDB collection store
// so the application always works seamlessly.

export interface DatabaseState {
  isConnected: boolean;
  type: 'mongodb' | 'embedded';
  uri?: string;
  error?: string;
}

export const dbState: DatabaseState = {
  isConnected: false,
  type: 'embedded',
};

// In-Memory fallback store matching MongoDB collection behavior
class MemoryCollection<T extends { _id?: string; id?: string }> {
  private items: Map<string, T> = new Map();

  constructor(private name: string) {}

  async create(item: Partial<T>): Promise<T> {
    const id = item._id || item.id || `${this.name}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newItem = { ...item, _id: id, id, createdAt: (item as any).createdAt || new Date(), updatedAt: new Date() } as unknown as T;
    this.items.set(id, newItem);
    return newItem;
  }

  async insertMany(items: Partial<T>[]): Promise<T[]> {
    const results: T[] = [];
    for (const item of items) {
      results.push(await this.create(item));
    }
    return results;
  }

  async find(filter: any = {}): Promise<T[]> {
    const all = Array.from(this.items.values());
    return all.filter(item => {
      for (const key of Object.keys(filter)) {
        if (key === '$or' && Array.isArray(filter.$or)) {
          const matchesAny = filter.$or.some((subFilter: any) => 
            Object.entries(subFilter).every(([k, v]) => (item as any)[k] === v)
          );
          if (!matchesAny) return false;
          continue;
        }
        if (typeof filter[key] === 'object' && filter[key] !== null) {
          if (filter[key].$gte && (item as any)[key] < filter[key].$gte) return false;
          if (filter[key].$lte && (item as any)[key] > filter[key].$lte) return false;
          if (filter[key].$gt && (item as any)[key] <= filter[key].$gt) return false;
          if (filter[key].$lt && (item as any)[key] >= filter[key].$lt) return false;
          if (filter[key].$ne && (item as any)[key] === filter[key].$ne) return false;
          if (filter[key].$in && !filter[key].$in.includes((item as any)[key])) return false;
          continue;
        }
        if ((item as any)[key] !== filter[key]) return false;
      }
      return true;
    });
  }

  async findOne(filter: any): Promise<T | null> {
    const results = await this.find(filter);
    return results[0] || null;
  }

  async findById(id: string): Promise<T | null> {
    return this.items.get(id) || null;
  }

  async findByIdAndUpdate(id: string, update: any, options: { new?: boolean } = {}): Promise<T | null> {
    const existing = this.items.get(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...(update.$set || update),
      updatedAt: new Date(),
    };
    this.items.set(id, updated);
    return updated;
  }

  async updateMany(filter: any, update: any): Promise<{ modifiedCount: number }> {
    const items = await this.find(filter);
    for (const item of items) {
      const id = (item as any)._id;
      const updated = {
        ...item,
        ...(update.$set || update),
        updatedAt: new Date(),
      };
      this.items.set(id, updated);
    }
    return { modifiedCount: items.length };
  }

  async deleteOne(filter: any): Promise<boolean> {
    const item = await this.findOne(filter);
    if (item && (item as any)._id) {
      return this.items.delete((item as any)._id);
    }
    return false;
  }

  async countDocuments(filter: any = {}): Promise<number> {
    const results = await this.find(filter);
    return results.length;
  }

  async clear(): Promise<void> {
    this.items.clear();
  }
}

export const memoryDb = {
  users: new MemoryCollection<any>('users'),
  waterReadings: new MemoryCollection<any>('waterReadings'),
  chemicalDosages: new MemoryCollection<any>('chemicalDosages'),
  anomalies: new MemoryCollection<any>('anomalies'),
  equipment: new MemoryCollection<any>('equipment'),
  maintenanceRecords: new MemoryCollection<any>('maintenanceRecords'),
  alerts: new MemoryCollection<any>('alerts'),
  chatMessages: new MemoryCollection<any>('chatMessages'),
  reports: new MemoryCollection<any>('reports'),
};

export async function connectDB(): Promise<DatabaseState> {
  const mongoUri = process.env.MONGO_URI;

  if (mongoUri && mongoUri.trim() !== '') {
    try {
      console.log('Connecting to MongoDB at:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      dbState.isConnected = true;
      dbState.type = 'mongodb';
      dbState.uri = mongoUri;
      console.log('✅ MongoDB connected successfully to external instance.');
      return dbState;
    } catch (err: any) {
      console.warn('⚠️ MongoDB connection to MONGO_URI failed, falling back to embedded MongoDB engine:', err.message);
      dbState.isConnected = true;
      dbState.type = 'embedded';
      dbState.error = err.message;
      return dbState;
    }
  }

  console.log('ℹ️ No MONGO_URI provided in environment. Utilizing embedded high-performance MongoDB store.');
  dbState.isConnected = true;
  dbState.type = 'embedded';
  return dbState;
}
