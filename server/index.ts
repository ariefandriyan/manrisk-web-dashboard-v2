import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initModels } from './models';

// Import routes
import dashboardRoutes from './routes/dashboard.routes';
import adminRoutes from './routes/admin.routes';
import departmentsRoutes from './routes/departments.routes';
import positionsRoutes from './routes/positions.routes';
import employeesRoutes from './routes/employees.routes';
import authRoutes from './routes/auth.routes';
import rolesRoutes from './routes/roles.routes';
import userRolesRoutes from './routes/user-roles.routes';
import achievementsRoutes from './routes/achievements.routes';
import targetsRoutes from './routes/targets.routes';
import syncRoutes from './routes/sync.routes';
import dashboardKRRoutes from './routes/dashboard-kapabilitas-risiko.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase payload limit for large data sync
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from frontend build in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../dist');
  app.use(express.static(distPath));
  console.log('📦 Serving static files from:', distPath);
}

// Initialize database and models
async function initializeDatabase() {
  try {
    await initModels();
    console.log('✅ Database and models initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/dashboard', dashboardKRRoutes); // Dashboard Kapabilitas Risiko
app.use('/api/admin', adminRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/positions', positionsRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api', authRoutes); // Auth routes (login)
app.use('/api/roles', rolesRoutes);
app.use('/api/user-roles', userRolesRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/targets', targetsRoutes);
app.use('/api', syncRoutes); // Sync routes (test-external-api, sync-all, last-sync, sync-logs)

// Serve frontend for all non-API routes in production (SPA fallback)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../../dist/index.html'));
    } else {
      res.status(404).json({
        success: false,
        message: 'API endpoint not found',
      });
    }
  });
} else {
  // 404 handler for development
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint not found',
    });
  });
}

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
    console.log(`🌐 Frontend available at http://localhost:${PORT}`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  });
});

export default app;
