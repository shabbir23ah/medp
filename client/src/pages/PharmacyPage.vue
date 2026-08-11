<template>
  <AppLayout>
    <div class="page-hero">
      <h1>💊 Pharmacy Portal</h1>
      <p>Manage your medicine catalog and orders.</p>
    </div>

    <div class="card">
      <h3>📦 Your Medicine Catalog</h3>
      <p class="sub">Publish your medicine list so patients can browse and order.</p>
      
      <div class="empty-catalog">
        <span class="empty-icon">🏪</span>
        <p>Catalog management coming in the next update.</p>
        <p class="hint">You'll be able to add medicines with name, price, stock, and images.</p>
      </div>
    </div>

    <div class="card">
      <h3>📋 Recent Orders</h3>
      <p class="sub">Orders from patients will appear here.</p>
      <div class="empty-state">
        <p>No orders yet. Your catalog needs to be published first.</p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '../components/AppLayout.vue';
</script>

<style scoped>
.page-hero { margin-bottom: 24px; }
.page-hero h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.8px; margin-bottom: 4px; }
.page-hero p { font-size: 14px; color: var(--text-muted); }
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 24px;
  margin-bottom: 14px;
}
.card h3 { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
.sub { font-size: 13px; color: var(--text-muted); margin-bottom: 20px; }
.empty-catalog { text-align: center; padding: 32px 16px; }
.empty-icon { font-size: 40px; display: block; margin-bottom: 12px; }
.empty-catalog p { font-size: 14px; color: var(--text-secondary); }
.hint { font-size: 12px; color: var(--text-muted); margin-top: 6px; }
.empty-state { text-align: center; padding: 32px; color: var(--text-muted); font-size: 14px; }
</style>
