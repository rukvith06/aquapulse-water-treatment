import { Router } from 'express';
import { EquipmentModel } from '../models/Equipment.ts';

const router = Router();

// List all equipment with health calculations
router.get('/', async (req, res) => {
  try {
    const list = await EquipmentModel.find();
    return res.json({ success: true, equipment: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Single equipment details
router.get('/:id', async (req, res) => {
  try {
    const item = await EquipmentModel.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Equipment not found.' });
    }
    return res.json({ success: true, equipment: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Update equipment status / perform routine calibration
router.put('/:id', async (req, res) => {
  try {
    const { status, healthScore, operatingHours, maintenanceRecommendation, maintenanceRisk } = req.body;
    const update: any = {};
    if (status !== undefined) update.status = status;
    if (healthScore !== undefined) update.healthScore = healthScore;
    if (operatingHours !== undefined) update.operatingHours = operatingHours;
    if (maintenanceRecommendation !== undefined) update.maintenanceRecommendation = maintenanceRecommendation;
    if (maintenanceRisk !== undefined) update.maintenanceRisk = maintenanceRisk;

    const updated = await EquipmentModel.updateById(req.params.id, update);
    return res.json({ success: true, equipment: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
