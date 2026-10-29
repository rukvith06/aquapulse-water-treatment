import { Router } from 'express';
import { AnomalyModel } from '../models/Anomaly.ts';
import { triggerForcedAnomaly } from '../services/simulationService.ts';

const router = Router();

// Get anomalies with filtering
router.get('/', async (req, res) => {
  try {
    const status = req.query.status as string;
    const severity = req.query.severity as string;
    const parameter = req.query.parameter as string;
    const limit = parseInt(req.query.limit as string, 10) || 50;

    const filter: any = {};
    if (status && status !== 'All') filter.status = status;
    if (severity && severity !== 'All') filter.severity = severity;
    if (parameter && parameter !== 'All') filter.parameter = parameter;

    const anomalies = await AnomalyModel.find(filter, { timestamp: -1 }, limit);
    const totalCount = await AnomalyModel.count();
    const activeCount = await AnomalyModel.count({ status: { $ne: 'Resolved' } });

    return res.json({
      success: true,
      anomalies,
      totalCount,
      activeCount,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Update anomaly status (Investigating / Resolved)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes, resolvedBy } = req.body;

    const update: any = { status };
    if (resolutionNotes) update.resolutionNotes = resolutionNotes;
    if (status === 'Resolved') {
      update.resolvedBy = resolvedBy || 'Plant Operator';
      update.resolvedAt = new Date();
    }

    const updated = await AnomalyModel.updateById(id, update);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Anomaly record not found.' });
    }

    return res.json({ success: true, anomaly: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Inject simulated anomaly for testing/demonstration
router.post('/inject', async (req, res) => {
  try {
    const { type } = req.body; // 'ph_acid', 'ph_alkali', 'turbidity_spike', 'flow_drop', 'temp_spike'

    if (!type) {
      return res.status(400).json({ success: false, message: 'Anomaly type required.' });
    }

    const reading = await triggerForcedAnomaly(type);
    return res.json({
      success: true,
      message: `Injected anomaly "${type}". Real-time reading generated and anomaly recorded.`,
      reading,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
