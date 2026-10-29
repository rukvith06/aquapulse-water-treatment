import { Router } from 'express';
import {
  simulationState,
  startSimulation,
  stopSimulation,
  seedInitialData,
} from '../services/simulationService.ts';
import { dbState } from '../config/db.ts';

const router = Router();

// Current simulation status
router.get('/status', (req, res) => {
  return res.json({
    success: true,
    state: simulationState,
    database: {
      type: dbState.type,
      isConnected: dbState.isConnected,
    },
  });
});

// Toggle simulation running state
router.post('/toggle', (req, res) => {
  if (simulationState.isRunning) {
    stopSimulation();
  } else {
    startSimulation(simulationState.intervalMs);
  }
  return res.json({
    success: true,
    isRunning: simulationState.isRunning,
    message: simulationState.isRunning ? 'Simulation resumed.' : 'Simulation paused.',
  });
});

// Update speed
router.post('/speed', (req, res) => {
  const { intervalMs } = req.body;
  const ms = Number(intervalMs);
  if (isNaN(ms) || ms < 1000 || ms > 30000) {
    return res.status(400).json({ success: false, message: 'Interval must be between 1000ms and 30000ms.' });
  }

  startSimulation(ms);
  return res.json({
    success: true,
    message: `Simulation rate updated to ${ms}ms per tick.`,
    intervalMs: ms,
  });
});

// Reset and reseed
router.post('/reseed', async (req, res) => {
  try {
    await seedInitialData();
    return res.json({ success: true, message: 'Database baseline re-seeded successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
