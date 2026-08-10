import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { pool } from './db/pool.js';
import authRoutes from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(config.UPLOAD_DIR));

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, data: { status: 'running' } });
});

// Error handler (must be last)
app.use(errorHandler);

// Test DB connection and start
pool.query('SELECT 1')
  .then(() => {
    console.log('Database connected');
    app.listen(config.PORT, () => {
      console.log(`Server running on http://localhost:${config.PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
