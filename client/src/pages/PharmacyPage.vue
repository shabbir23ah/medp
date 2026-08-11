<template>
  <AppLayout>
    <div class="page-hero">
      <h1>🏪 {{ auth.user?.name || 'Pharmacy' }}</h1>
      <p>{{ today }}</p>
    </div>

    <div class="stats-row">
      <div class="stat-card accent">
        <span class="stat-num">{{ medicineCount }}</span>
        <span class="stat-label">Medicines Listed</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">0</span>
        <span class="stat-label">Orders Today</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">0</span>
        <span class="stat-label">Total Orders</span>
      </div>
    </div>

    <div class="actions-row">
      <button class="action-btn" disabled>
        <span class="action-icon">➕</span>
        <span>Add Medicine</span>
      </button>
      <button class="action-btn" disabled>
        <span class="action-icon">📋</span>
        <span>View Orders</span>
      </button>
      <button class="action-btn" disabled>
        <span class="action-icon">📊</span>
        <span>Analytics</span>
      </button>
    </div>

    <div class="section-card">
      <h3>📦 Medicine Catalog</h3>
      <p class="sub">Your store's medicine list for patients to browse and order.</p>
      <div class="empty-lg">
        <span class="empty-icon">🏗️</span>
        <h4>Catalog Coming Soon</h4>
        <p>You'll be able to add medicines with name, category, price, stock, and images. Patients will browse and order directly from your store.</p>
      </div>
    </div>

    <div class="section-card">
      <h3>📋 Recent Orders</h3>
      <div class="empty">No orders yet. Your catalog needs products first.</div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '../components/AppLayout.vue';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
const medicineCount = 0;
</script>

<style scoped>
.page-hero { margin-bottom: 24px; }
.page-hero h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.8px; margin-bottom: 2px; }
.page-hero p { font-size: 13px; color: var(--text-muted); }

.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
.stat-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 16px; padding: 16px; text-align: center;
}
.stat-card.accent { background: var(--primary-bg); border-color: transparent; }
.stat-num { font-size: 24px; font-weight: 800; display: block; }
.stat-card.accent .stat-num { color: var(--primary); }
.stat-label { font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }

.actions-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
.action-btn {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 16px 8px; background: var(--surface); border: 1px solid var(--border);
  border-radius: 14px; text-decoration: none; color: var(--text);
  font-size: 12px; font-weight: 600; opacity: 0.6;
}
.action-icon { font-size: 24px; }

.section-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 18px; padding: 20px; margin-bottom: 14px;
}
.section-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
.sub { font-size: 13px; color: var(--text-muted); margin-bottom: 16px; }

.empty-lg { text-align: center; padding: 32px 16px; }
.empty-icon { font-size: 40px; display: block; margin-bottom: 12px; }
.empty-lg h4 { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
.empty-lg p { font-size: 13px; color: var(--text-muted); line-height: 1.6; max-width: 320px; margin: 0 auto; }

.empty { text-align: center; padding: 24px; color: var(--text-muted); font-size: 13px; }
</style>
