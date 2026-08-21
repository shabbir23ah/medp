// PM2 ecosystem config — keeps the API server running in production
// Usage: pm2 start ecosystem.config.js --env production
//
// Secrets come from the process environment (or a .env file loaded by
// dotenv in config.ts). NEVER hardcode DATABASE_URL / JWT_SECRET here.
module.exports = {
  apps: [
    {
      name: 'medprescription-api',
      cwd: './server',
      script: 'dist/index.js',
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
      // Logs — override in the VPS-specific ecosystem if needed
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      merge_logs: true,
      time: true,
    },
  ],
};
