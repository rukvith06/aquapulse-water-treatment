import { Router } from 'express';
import { WaterReadingModel } from '../models/WaterReading.ts';
import { AnomalyModel } from '../models/Anomaly.ts';
import { ChemicalDosageModel } from '../models/ChemicalDosage.ts';
import { MaintenanceRecordModel } from '../models/MaintenanceRecord.ts';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const timeframe = (req.query.timeframe as string) || 'today';
    let limit = 50;
    if (timeframe === '7days') limit = 100;
    if (timeframe === '30days') limit = 200;

    const readings = await WaterReadingModel.find({}, { timestamp: 1 }, limit);
    const anomalies = await AnomalyModel.find({}, { timestamp: -1 }, 50);
    const dosages = await ChemicalDosageModel.find({}, { timestamp: -1 }, 30);
    const maintenance = await MaintenanceRecordModel.find({}, { date: -1 }, 20);

    // Compute metrics
    let totalPh = 0;
    let totalTurb = 0;
    let totalTemp = 0;
    let totalFlow = 0;
    let compliantCount = 0;

    readings.forEach((r: any) => {
      totalPh += r.ph || 0;
      totalTurb += r.turbidity || 0;
      totalTemp += r.temperature || 0;
      totalFlow += r.flowRate || 0;
      if (r.status === 'Normal') compliantCount++;
    });

    const count = readings.length || 1;
    const avgPh = Number((totalPh / count).toFixed(2));
    const avgTurbidity = Number((totalTurb / count).toFixed(2));
    const avgTemperature = Number((totalTemp / count).toFixed(1));
    const avgFlowRate = Math.round(totalFlow / count);
    const complianceRate = Number(((compliantCount / count) * 100).toFixed(1));

    // Estimated volume treated based on average flow rate
    const hours = timeframe === 'today' ? 24 : timeframe === '7days' ? 168 : 720;
    const estimatedVolumeM3 = Math.round(avgFlowRate * hours);

    // Group anomalies by parameter
    const anomalyParamCounts: Record<string, number> = {
      pH: 0,
      Turbidity: 0,
      Temperature: 0,
      'Flow Rate': 0,
    };
    anomalies.forEach((a: any) => {
      if (anomalyParamCounts[a.parameter] !== undefined) {
        anomalyParamCounts[a.parameter]++;
      }
    });

    return res.json({
      success: true,
      timeframe,
      metrics: {
        avgPh,
        avgTurbidity,
        avgTemperature,
        avgFlowRate,
        complianceRate,
        estimatedVolumeM3,
        totalReadingsAnalyzed: readings.length,
        anomaliesCount: anomalies.length,
        maintenanceCount: maintenance.length,
      },
      timeSeries: readings.map((r: any) => ({
        timestamp: r.timestamp,
        ph: r.ph,
        turbidity: r.turbidity,
        temperature: r.temperature,
        flowRate: r.flowRate,
        status: r.status,
      })),
      anomaliesDistribution: anomalyParamCounts,
      recentDosages: dosages.slice(0, 10),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
