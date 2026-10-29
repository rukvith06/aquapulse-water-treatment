import { Router } from 'express';
import { AlertModel } from '../models/Alert';

const router = Router();

// Get alerts with filter
router.get('/', async (req, res) => {
  try {
    const status = req.query.status as string;
    const severity = req.query.severity as string;
    const limit = parseInt(req.query.limit as string, 10) || 50;

    const filter: any = {};
    if (status && status !== 'All') filter.status = status;
    if (severity && severity !== 'All') filter.severity = severity;

    const alerts = await AlertModel.find(filter, { timestamp: -1 }, limit);
    const activeCount = await AlertModel.count({ status: 'Active' });
    const criticalCount = await AlertModel.count({ status: 'Active', severity: 'Critical' });

    return res.json({
      success: true,
      alerts,
      activeCount,
      criticalCount,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Acknowledge single alert
router.put('/:id/acknowledge', async (req, res) => {
  try {
    const { acknowledgedBy } = req.body;
    const updated = await AlertModel.updateById(req.params.id, {
      status: 'Acknowledged',
      acknowledgedBy: acknowledgedBy || 'Operator',
      acknowledgedAt: new Date(),
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    return res.json({ success: true, alert: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Acknowledge all active alerts
router.post('/acknowledge-all', async (req, res) => {
  try {
    const { acknowledgedBy } = req.body;
    const activeAlerts = await AlertModel.find({ status: 'Active' });
    for (const a of activeAlerts) {
      await AlertModel.updateById(a._id || a.id, {
        status: 'Acknowledged',
        acknowledgedBy: acknowledgedBy || 'Operator',
        acknowledgedAt: new Date(),
      });
    }

    return res.json({
      success: true,
      message: `Acknowledged ${activeAlerts.length} active alerts.`,
      count: activeAlerts.length,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
