import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB } from './server/config/db.ts';
import { seedInitialData, startSimulation } from './server/services/simulationService.ts';

// Import route modules
import authRoutes from './server/routes/authRoutes.ts';
import readingRoutes from './server/routes/readingRoutes.ts';
import dosageRoutes from './server/routes/dosageRoutes.ts';
import anomalyRoutes from './server/routes/anomalyRoutes.ts';
import equipmentRoutes from './server/routes/equipmentRoutes.ts';
import maintenanceRoutes from './server/routes/maintenanceRoutes.ts';
import alertRoutes from './server/routes/alertRoutes.ts';
import analyticsRoutes from './server/routes/analyticsRoutes.ts';
import reportRoutes from './server/routes/reportRoutes.ts';
import aiRoutes from './server/routes/aiRoutes.ts';
import simulationRoutes from './server/routes/simulationRoutes.ts';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

export async function createApp({ serverless = false }: { serverless?: boolean } = {}) {
  const app = express();

  // Basic Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logger for API calls
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[${req.method}] ${req.path}`);
    }
    next();
  });

  // Connect to MongoDB
  await connectDB();

  // Seed default data & start sensor simulation engine
  await seedInitialData();
  if (!serverless) {
    startSimulation(4000);
  }

  // Mount Backend API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/water-readings', readingRoutes);
  app.use('/api/dosage', dosageRoutes);
  app.use('/api/anomalies', anomalyRoutes);
  app.use('/api/equipment', equipmentRoutes);
  app.use('/api/maintenance', maintenanceRoutes);
  app.use('/api/alerts', alertRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/simulation', simulationRoutes);

  // Healthcheck endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'UP',
      system: 'AquaPulse AI Water Treatment Monitoring & Optimization Platform',
      stack: 'MERN (MongoDB, Express, React, Node)',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: 'API endpoint not found.' });
  });

  // Mount Vite or Static Frontend
  if (!serverless && !isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (!serverless) {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}

async function bootstrapServer() {
  const app = await createApp();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌊 AquaPulse MERN Server listening on http://0.0.0.0:${PORT}`);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  bootstrapServer().catch((err) => {
    console.error('Fatal Server Boot Error:', err);
    process.exit(1);
  });
}
