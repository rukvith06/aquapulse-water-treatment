import { Router } from 'express';
import { ChemicalDosageModel } from '../models/ChemicalDosage.ts';
import { simulationState } from '../services/simulationService.ts';
import { AlertModel } from '../models/Alert.ts';

const router = Router();

// Current active chemical dosages
router.get('/', async (req, res) => {
  try {
    const list = await ChemicalDosageModel.findLatest();
    return res.json({
      success: true,
      dosages: list,
      activeRates: simulationState.currentDosages,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Apply new chemical dosages
router.post('/apply', async (req, res) => {
  try {
    const { alum, chlorine, sodaAsh, polymer, reason, operatorName } = req.body;

    if (alum !== undefined) simulationState.currentDosages.alum = Number(alum);
    if (chlorine !== undefined) simulationState.currentDosages.chlorine = Number(chlorine);
    if (sodaAsh !== undefined) simulationState.currentDosages.sodaAsh = Number(sodaAsh);
    if (polymer !== undefined) simulationState.currentDosages.polymer = Number(polymer);

    // Save record to DB
    const record = await ChemicalDosageModel.create({
      chemicalName: 'Multi-Chemical Dosing Adjustment',
      category: 'Coagulation',
      currentDosage: simulationState.currentDosages.alum,
      recommendedDosage: simulationState.currentDosages.alum,
      difference: 0,
      unit: 'mg/L',
      reason: reason || 'Operator approved AI recommendation and calibrated metering pump strokes.',
      riskLevel: 'Low',
      status: 'Applied',
      waterConditions: { ph: 7.3, turbidity: 1.8, temperature: 19.5, flowRate: 245 },
      aiGenerated: false,
      appliedBy: operatorName || 'Operator',
      timestamp: new Date(),
    });

    await AlertModel.create({
      type: 'Chemical Dosage',
      severity: 'Info',
      title: 'Chemical Dosage Rates Updated',
      message: `New dosage rates applied: Alum=${simulationState.currentDosages.alum} mg/L, Chlorine=${simulationState.currentDosages.chlorine} mg/L, Soda Ash=${simulationState.currentDosages.sodaAsh} mg/L`,
      status: 'Active',
      timestamp: new Date(),
    });

    return res.json({
      success: true,
      message: 'Chemical dosing rates successfully recalibrated in SCADA system.',
      activeRates: simulationState.currentDosages,
      record,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Historical dosage changes
router.get('/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 30;
    const history = await ChemicalDosageModel.find({}, { timestamp: -1 }, limit);
    return res.json({ success: true, history });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
