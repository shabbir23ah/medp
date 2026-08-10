import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { pool } from './db/pool.js';

const app = express();
app.use(cors());
app.use(express.json());

// Test DB connection on startup
pool.query('SELECT 1')
  .then(() => console.log('Database connected'))
  .catch(err => { console.error('Database connection failed:', err.message); process.exit(1); });

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, data: { status: 'running' } });
});

app.listen(config.PORT, () => {
  console.log(`Server running on http://localhost:${config.PORT}`);
});
