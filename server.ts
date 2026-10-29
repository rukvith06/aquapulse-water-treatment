import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { connectDB } from './server/config/db';
import { seedInitialData, startSimulation } from './server/services/simulationService';

// Import route modules
import authRoutes from './server/routes/authRoutes';
import readingRoutes from './server/routes/readingRoutes';
import dosageRoutes from './server/routes/dosageRoutes';
import anomalyRoutes from './server/routes/anomalyRoutes';
import equipmentRoutes from './server/routes/equipmentRoutes';
import maintenanceRoutes from './server/routes/maintenanceRoutes';
import alertRoutes from './server/routes/alertRoutes';
import analyticsRoutes from './server/routes/analyticsRoutes';
import reportRoutes from './server/routes/reportRoutes';
import aiRoutes from './server/routes/aiRoutes';
import simulationRoutes from './server/routes/simulationRoutes';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

async function bootstrapServer() {
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
  startSimulation(4000);

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

  // Mount Vite or Static Frontend
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌊 AquaPulse MERN Server listening on http://0.0.0.0:${PORT}`);
  });
}

bootstrapServer().catch((err) => {
  console.error('Fatal Server Boot Error:', err);
  process.exit(1);
});
