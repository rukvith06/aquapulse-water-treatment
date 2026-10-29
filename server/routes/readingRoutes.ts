import { Router } from 'express';
import { WaterReadingModel } from '../models/WaterReading';
import { runSimulationTick } from '../services/simulationService';
import { AnomalyModel } from '../models/Anomaly';
import { AlertModel } from '../models/Alert';

const router = Router();

// Latest water reading
router.get('/latest', async (req, res) => {
  try {
    const latest = await WaterReadingModel.findLatest(1);
    if (!latest || latest.length === 0) {
      // Trigger one tick if empty
      const fresh = await runSimulationTick();
      return res.json({ success: true, reading: fresh });
    }
    return res.json({ success: true, reading: latest[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Historical water readings with filtering
router.get('/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const stage = req.query.stage as string;
    const filter: any = {};

    if (stage) {
      filter.stage = stage;
    }

    const readings = await WaterReadingModel.find(filter, { timestamp: -1 }, limit);
    return res.json({ success: true, readings });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Manual reading entry
router.post('/', async (req, res) => {
  try {
    const { ph, turbidity, temperature, flowRate, dissolvedOxygen, conductivity, stage } = req.body;

    if (ph === undefined || turbidity === undefined || temperature === undefined || flowRate === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: ph, turbidity, temperature, flowRate.',
      });
    }

    const numPh = Number(ph);
    const numTurb = Number(turbidity);
    const numTemp = Number(temperature);
    const numFlow = Number(flowRate);

    let status: 'Normal' | 'Warning' | 'Critical' = 'Normal';
    if (numPh < 6.0 || numPh > 9.0 || numTurb > 10.0 || numFlow < 80) {
      status = 'Critical';
    } else if (numPh < 6.5 || numPh > 8.5 || numTurb > 5.0 || numFlow > 480) {
      status = 'Warning';
    }

    const reading = await WaterReadingModel.create({
      ph: numPh,
      turbidity: numTurb,
      temperature: numTemp,
      flowRate: numFlow,
      dissolvedOxygen: dissolvedOxygen ? Number(dissolvedOxygen) : 7.2,
      conductivity: conductivity ? Number(conductivity) : 320,
      status,
      stage: stage || 'Treated Outlet',
      timestamp: new Date(),
    });

    // Check for anomalies if out of spec
    if (status !== 'Normal') {
      const isCritical = status === 'Critical';
      const anomTitle = numPh < 6.5 || numPh > 8.5 ? 'Manual Entry: pH Anomaly' : 'Manual Entry: Turbidity Anomaly';
      await AnomalyModel.create({
        anomalyType: anomTitle,
        parameter: numPh < 6.5 || numPh > 8.5 ? 'pH' : 'Turbidity',
        currentValue: numPh < 6.5 || numPh > 8.5 ? numPh : numTurb,
        expectedRange: numPh < 6.5 || numPh > 8.5 ? '6.5 - 8.5' : '< 5.0 NTU',
        severity: isCritical ? 'Critical' : 'Medium',
        recommendedAction: 'Verify laboratory grab sample calibration and adjust chemical dosing pump accordingly.',
        status: 'Detected',
      });

      await AlertModel.create({
        type: 'Water Quality',
        severity: isCritical ? 'Critical' : 'Warning',
        title: anomTitle,
        message: `Operator manual log recorded ${numPh < 6.5 || numPh > 8.5 ? `pH ${numPh}` : `Turbidity ${numTurb} NTU`}, out of compliance.`,
        status: 'Active',
      });
    }

    return res.status(201).json({ success: true, reading });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Trigger immediate simulation tick
router.post('/simulate-tick', async (req, res) => {
  try {
    const reading = await runSimulationTick();
    return res.json({ success: true, reading });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
