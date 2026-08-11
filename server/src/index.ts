import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import cron from 'node-cron';
import { config } from './config.js';
import { pool } from './db/pool.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import prescriptionRoutes from './routes/prescriptions.js';
import reportRoutes from './routes/reports.js';
import reminderRoutes from './routes/reminders.js';
import doctorRoutes from './routes/doctors.js';
import appointmentRoutes from './routes/appointments.js';
import chatRoutes from './routes/chat.js';
import { errorHandler } from './middleware/errorHandler.js';
import { processScheduledNotifications } from './services/notification.js';
import { initSocket } from './socket.js';

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(config.UPLOAD_DIR));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/chat', chatRoutes);

// Start notification cron — checks every minute
cron.schedule('* * * * *', () => {
  processScheduledNotifications().catch(err =>
    console.error('Notification cron error:', err)
  );
});
console.log('Notification cron started (every 1 min)');

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
    const httpServer = createServer(app);
    initSocket(httpServer);
    httpServer.listen(config.PORT, () => {
      console.log(`Server running on http://localhost:${config.PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
