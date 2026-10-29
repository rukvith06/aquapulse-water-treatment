import mongoose, { Schema, Document } from 'mongoose';
import { dbState, memoryDb } from '../config/db';

export interface IReport extends Document {
  reportTitle: string;
  reportType: 'Daily Operational' | 'Water Quality Compliance' | 'Chemical Usage Audit' | 'Equipment Health' | 'Comprehensive Plant Audit';
  generatedBy: string;
  periodStart: Date;
  periodEnd: Date;
  summary: {
    avgPh: number;
    avgTurbidity: number;
    avgTemperature: number;
    avgFlowRate: number;
    totalTreatedVolumeM3: number;
    anomalyCount: number;
    criticalAlertsCount: number;
    maintenanceItemsCount: number;
    complianceStatus: 'Fully Compliant' | 'Sub-optimal' | 'Non-Compliant';
  };
  details: Record<string, any>;
  createdAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reportTitle: { type: String, required: true },
    reportType: {
      type: String,
      enum: ['Daily Operational', 'Water Quality Compliance', 'Chemical Usage Audit', 'Equipment Health', 'Comprehensive Plant Audit'],
      required: true,
    },
    generatedBy: { type: String, required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    summary: {
      avgPh: { type: Number, required: true },
      avgTurbidity: { type: Number, required: true },
      avgTemperature: { type: Number, required: true },
      avgFlowRate: { type: Number, required: true },
      totalTreatedVolumeM3: { type: Number, required: true },
      anomalyCount: { type: Number, required: true },
      criticalAlertsCount: { type: Number, required: true },
      maintenanceItemsCount: { type: Number, required: true },
      complianceStatus: {
        type: String,
        enum: ['Fully Compliant', 'Sub-optimal', 'Non-Compliant'],
        default: 'Fully Compliant',
      },
    },
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const MongooseReport =
  mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);

export const ReportModel = {
  async create(data: Partial<IReport>) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      const doc = await MongooseReport.create(data);
      return doc.toObject();
    }
    return memoryDb.reports.create(data);
  },

  async find(query: any = {}, sort: any = { createdAt: -1 }, limit: number = 50) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseReport.find(query).sort(sort).limit(limit).lean();
    }
    const results = await memoryDb.reports.find(query);
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
  },

  async findById(id: string) {
    if (dbState.type === 'mongodb' && mongoose.connection.readyState === 1) {
      return MongooseReport.findById(id).lean();
    }
    return memoryDb.reports.findById(id);
  },
};
