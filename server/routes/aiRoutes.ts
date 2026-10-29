import { Router } from 'express';
import { generateDosageRecommendation, chatWithAssistant } from '../services/geminiService.ts';
import { WaterReadingModel } from '../models/WaterReading.ts';
import { AnomalyModel } from '../models/Anomaly.ts';
import { AlertModel } from '../models/Alert.ts';
import { ChemicalDosageModel } from '../models/ChemicalDosage.ts';
import { ChatMessageModel } from '../models/ChatMessage.ts';
import { simulationState } from '../services/simulationService.ts';

const router = Router();

// POST /api/ai/dosage-recommendation
router.post('/dosage-recommendation', async (req, res) => {
  try {
    let { ph, turbidity, temperature, flowRate } = req.body;

    // If parameters not provided in body, grab latest live reading from DB
    if (ph === undefined || turbidity === undefined) {
      const latest = await WaterReadingModel.findLatest(1);
      if (latest && latest[0]) {
        ph = latest[0].ph;
        turbidity = latest[0].turbidity;
        temperature = latest[0].temperature;
        flowRate = latest[0].flowRate;
      } else {
        ph = 7.3;
        turbidity = 1.8;
        temperature = 19.5;
        flowRate = 245;
      }
    }

    const aiResult = await generateDosageRecommendation({
      ph: Number(ph),
      turbidity: Number(turbidity),
      temperature: Number(temperature || 20),
      flowRate: Number(flowRate || 250),
      currentDosages: simulationState.currentDosages,
    });

    // Save recommendation to MongoDB ChemicalDosage collection
    await ChemicalDosageModel.create({
      chemicalName: 'AI Multi-Agent Dosing Optimization',
      category: 'Coagulation',
      currentDosage: simulationState.currentDosages.alum,
      recommendedDosage: aiResult.suggestedDosages.alum,
      difference: Number((aiResult.suggestedDosages.alum - simulationState.currentDosages.alum).toFixed(2)),
      unit: 'mg/L',
      reason: aiResult.reason,
      riskLevel: aiResult.riskLevel,
      status: aiResult.status,
      waterConditions: {
        ph: Number(ph),
        turbidity: Number(turbidity),
        temperature: Number(temperature || 20),
        flowRate: Number(flowRate || 250),
      },
      aiGenerated: true,
      timestamp: new Date(),
    });

    return res.json({
      success: true,
      data: aiResult,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
    }

    // 1. Gather real-time plant telemetry from MongoDB for grounded context
    const latestReadings = await WaterReadingModel.findLatest(1);
    const activeAlerts = await AlertModel.count({ status: 'Active' });
    const activeAnomalies = await AnomalyModel.count({ status: { $ne: 'Resolved' } });

    const latest = latestReadings[0] || {
      ph: 7.3,
      turbidity: 1.8,
      temperature: 19.5,
      flowRate: 245,
      dissolvedOxygen: 7.4,
    };

    const plantContext = {
      ph: latest.ph,
      turbidity: latest.turbidity,
      temperature: latest.temperature,
      flowRate: latest.flowRate,
      dissolvedOxygen: latest.dissolvedOxygen,
      activeAlertsCount: activeAlerts,
      activeAnomaliesCount: activeAnomalies,
      dosages: simulationState.currentDosages,
      simulationMode: simulationState.isRunning ? 'Active SCADA Inflow' : 'Paused',
    };

    // 2. Load recent conversation history from MongoDB
    const history = await ChatMessageModel.find({}, { timestamp: 1 }, 10);

    // 3. Save User message to MongoDB
    await ChatMessageModel.create({
      sender: 'user',
      text: message,
      userId,
      contextData: plantContext,
      timestamp: new Date(),
    });

    // 4. Query Gemini API via backend service
    const replyText = await chatWithAssistant(
      message,
      history.map((h: any) => ({ sender: h.sender, text: h.text })),
      plantContext
    );

    // 5. Save Assistant reply to MongoDB
    const assistantMsg = await ChatMessageModel.create({
      sender: 'assistant',
      text: replyText,
      userId,
      contextData: plantContext,
      timestamp: new Date(),
    });

    return res.json({
      success: true,
      message: assistantMsg,
      plantContext,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/ai/chat-history
router.get('/chat-history', async (req, res) => {
  try {
    const messages = await ChatMessageModel.find({}, { timestamp: 1 }, 50);
    return res.json({ success: true, messages });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/ai/chat-history
router.delete('/chat-history', async (req, res) => {
  try {
    await ChatMessageModel.clear();
    return res.json({ success: true, message: 'Chat history cleared.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
