#!/bin/bash
# ── MedPrescription VPS Deploy Script ──
# Run on your VPS after cloning the repo:
#   bash deploy/deploy.sh
set -e

echo "🚀 MedPrescription Deploy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Install dependencies
echo "📦 Installing server dependencies..."
cd server
npm install --production

# 2. Build backend
echo "🔨 Building backend..."
npm run build

# 3. Run database migrations
echo "🗄️  Running migrations..."
npm run migrate

# 4. Seed demo data (optional — comment out for production)
# npm run seed

# 5. Build frontend
echo "🎨 Building frontend..."
cd ../client
npm install
npm run build

# 6. Deploy built frontend to web root
echo "📁 Copying frontend to /var/www/medprescription..."
sudo mkdir -p /var/www/medprescription
sudo cp -r dist/* /var/www/medprescription/

# 7. Copy uploads directory
echo "🖼️  Setting up uploads..."
sudo mkdir -p /var/www/medprescription/uploads
sudo chown -R www-data:www-data /var/www/medprescription/uploads

echo ""
echo "✅ Build complete!"
echo ""
echo "Next steps:"
echo "  1. Configure .env:        cp .env.example .env  (edit values!)"
echo "  2. Configure Nginx:       sudo cp deploy/nginx.conf /etc/nginx/sites-available/medprescription"
echo "                             (edit domain name in the config)"
echo "  3. Enable site:           sudo ln -s /etc/nginx/sites-available/medprescription /etc/nginx/sites-enabled/"
echo "  4. Test Nginx:            sudo nginx -t && sudo systemctl reload nginx"
echo "  5. Start backend:         cd server && pm2 start ../ecosystem.config.js --env production"
echo "  6. Save PM2:              pm2 save && pm2 startup"
echo "  7. HTTPS (optional):      sudo certbot --nginx -d yourdomain.com"
