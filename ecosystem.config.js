// PM2 ecosystem config — keeps the API server running in production
// Usage: pm2 start ecosystem.config.js --env production
module.exports = {
  apps: [
    {
      name: 'medprescription-api',
      cwd: './server',
      script: 'dist/index.js',
      // Build first: cd server && npm run build
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      // Logs
      out_file: '/var/log/medprescription/out.log',
      error_file: '/var/log/medprescription/error.log',
      merge_logs: true,
      time: true,
    },
  ],
};
