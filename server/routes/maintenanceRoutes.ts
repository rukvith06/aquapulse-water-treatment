import { Router } from 'express';
import { MaintenanceRecordModel } from '../models/MaintenanceRecord.ts';
import { EquipmentModel } from '../models/Equipment.ts';

const router = Router();

// Get maintenance records
router.get('/', async (req, res) => {
  try {
    const records = await MaintenanceRecordModel.find({}, { date: -1 }, 50);
    return res.json({ success: true, records });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Schedule or log completed maintenance
router.post('/', async (req, res) => {
  try {
    const { equipmentId, equipmentName, maintenanceType, description, performedBy, status, partsReplaced, cost, downtimeHours, notes } = req.body;

    if (!equipmentId || !equipmentName || !maintenanceType || !description) {
      return res.status(400).json({ success: false, message: 'Equipment ID, name, type, and description are required.' });
    }

    const record = await MaintenanceRecordModel.create({
      equipmentId,
      equipmentName,
      maintenanceType,
      description,
      performedBy: performedBy || 'Operator',
      status: status || 'Completed',
      partsReplaced: partsReplaced || [],
      cost: cost ? Number(cost) : 0,
      downtimeHours: downtimeHours ? Number(downtimeHours) : 0,
      notes,
      date: new Date(),
    });

    // If completed, update equipment health score & reset maintenance date
    if (status === 'Completed') {
      const eq = await EquipmentModel.findOne({ code: equipmentId }) || await EquipmentModel.findById(equipmentId);
      if (eq) {
        await EquipmentModel.updateById(eq._id || eq.id, {
          healthScore: 98,
          status: 'Operational',
          maintenanceRisk: 'Low',
          lastMaintenance: new Date(),
          nextMaintenance: new Date(Date.now() + 60 * 24 * 3600 * 1000),
          maintenanceRecommendation: 'Post-service baseline optimal. Schedule standard visual inspection in 30 days.',
        });
      }
    }

    return res.status(201).json({ success: true, record });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
