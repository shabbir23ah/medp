<template>
  <AppLayout>
    <div class="page-hero">
      <h1><Store :size="22" :stroke-width="2" class="inline-icon" /> {{ auth.user?.name || 'Pharmacy' }}</h1>
      <p>{{ today }}</p>
    </div>

    <div class="stats-row">
      <div class="stat-card accent">
        <span class="stat-num">{{ medicines.length }}</span>
        <span class="stat-label">Products</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ pendingOrders }}</span>
        <span class="stat-label">Pending Orders</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ orders.length }}</span>
        <span class="stat-label">Total Orders</span>
      </div>
    </div>

    <!-- Add Medicine -->
    <div class="section-card">
      <h3>➕ Add Medicine</h3>
      <div class="add-form">
        <input v-model="form.name" placeholder="Medicine name" />
        <div class="form-row">
          <input v-model="form.category" placeholder="Category" />
          <input v-model.number="form.price" type="number" placeholder="Price (৳)" />
          <input v-model.number="form.stock" type="number" placeholder="Stock" />
        </div>
        <textarea v-model="form.description" placeholder="Description" rows="2"></textarea>
        <label class="checkbox"><input v-model="form.requiresPrescription" type="checkbox" /> Requires prescription</label>
        <button @click="addMedicine" :disabled="adding || !form.name || !form.price" class="btn-add">
          {{ adding ? 'Adding...' : 'Add to Catalog' }}
        </button>
      </div>
    </div>

    <!-- Catalog -->
    <div class="section-card">
      <h3>📦 Catalog ({{ medicines.length }})</h3>
      <div v-if="medicines.length === 0" class="empty">No products yet</div>
      <div v-for="m in medicines" :key="m.id" class="med-row">
        <div>
          <strong>{{ m.name }}</strong>
          <span>৳{{ m.price }} · Stock: {{ m.stock }} · {{ m.category }}</span>
        </div>
        <button @click="deleteMed(m.id)" class="del-btn"><Trash2 :size="14" :stroke-width="2" class="inline-icon" /></button>
      </div>
    </div>

    <!-- Orders -->
    <div class="section-card">
      <h3><ClipboardList :size="14" :stroke-width="2" class="inline-icon" /> Orders ({{ orders.length }})</h3>
      <div v-if="orders.length === 0" class="empty">No orders yet</div>
      <div v-for="o in orders" :key="o.id" class="order-row">
        <div>
          <span class="badge" :class="o.status">{{ o.status }}</span>
          <strong>৳{{ o.total_amount }}</strong>
          <span class="addr">{{ o.delivery_address }} · {{ o.patient_phone }}</span>
          <span class="date">{{ fmtDate(o.created_at) }}</span>
        </div>
        <select v-if="o.status !== 'delivered' && o.status !== 'cancelled'" @change="updateStatus(o.id, ($event.target as HTMLSelectElement).value)" class="status-select">
          <option value="">Update</option>
          <option value="confirmed">Confirm</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useAuthStore } from '../stores/auth';
import { useApi } from '../composables/useApi';
import { Trash2, ClipboardList, Store } from 'lucide-vue-next';

const auth = useAuthStore();
const api = useApi();
const medicines = ref<any[]>([]);
const orders = ref<any[]>([]);
const adding = ref(false);

const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

const pendingOrders = computed(() => orders.value.filter(o => o.status === 'pending').length);

const form = reactive({
  name: '', category: '', price: 0, stock: 10, description: '', requiresPrescription: false,
});

async function load() {
  const [mRes, oRes] = await Promise.all([
    api.get('/pharmacy/medicines/mine'),
    api.get('/pharmacy/orders'),
  ]);
  if (mRes.data.ok) medicines.value = mRes.data.data;
  if (oRes.data.ok) orders.value = oRes.data.data;
}

onMounted(load);

async function addMedicine() {
  if (!form.name || !form.price) return;
  adding.value = true;
  try {
    await api.post('/pharmacy/medicines', { ...form });
    form.name = ''; form.category = ''; form.price = 0; form.stock = 10; form.description = '';
    await load();
  } finally { adding.value = false; }
}

async function deleteMed(id: string) {
  await api.delete(`/pharmacy/medicines/${id}`);
  await load();
}

async function updateStatus(id: string, status: string) {
  if (!status) return;
  await api.put(`/pharmacy/orders/${id}`, { status });
  await load();
}

function fmtDate(d: string) { return new Date(d).toLocaleDateString(); }
</script>

<style scoped>
.page-hero { margin-bottom: 24px; }
.page-hero h1 { font-size: 24px; font-weight: 800; }
.page-hero p { font-size: 13px; color: var(--text-muted); }
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
.stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 16px; text-align: center; }
.stat-card.accent { background: var(--primary-bg); border-color: transparent; }
.stat-num { font-size: 24px; font-weight: 800; display: block; }
.stat-card.accent .stat-num { color: var(--primary); }
.stat-label { font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
.section-card { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 20px; margin-bottom: 14px; }
.section-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
.add-form { display: flex; flex-direction: column; gap: 8px; }
.add-form input, .add-form textarea { padding: 10px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; background: var(--bg); color: var(--text); }
.form-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.checkbox { font-size: 13px; display: flex; align-items: center; gap: 6px; }
.btn-add { padding: 10px; background: var(--primary); color: var(--primary-text); border-radius: 10px; font-weight: 700; }
.btn-add:disabled { opacity: 0.5; }
.med-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-light); }
.med-row strong { display: block; font-size: 14px; }
.med-row span { font-size: 11px; color: var(--text-muted); display: block; }
.del-btn { color: var(--danger); font-size: 16px; }
.order-row { padding: 12px 0; border-bottom: 1px solid var(--border-light); }
.order-row strong { margin: 0 8px; }
.addr { font-size: 11px; color: var(--text-muted); display: block; }
.date { font-size: 11px; color: var(--text-muted); }
.badge { padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
.badge.pending { background: var(--warning-bg); color: var(--warning); }
.badge.confirmed { background: var(--success-bg); color: var(--success); }
.badge.shipped { background: var(--primary-bg); color: var(--primary); }
.status-select { margin-top: 4px; padding: 6px; border-radius: 6px; border: 1px solid var(--border); font-size: 12px; background: var(--bg); color: var(--text); }
.empty { text-align: center; padding: 24px; color: var(--text-muted); font-size: 13px; }
.inline-icon { display: inline-block; vertical-align: -2px; }
</style>
