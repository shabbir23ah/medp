<template>
  <AppLayout>
    <div class="page-hero">
      <h1>🛒 Medicine Shop</h1>
      <p>Order medicines from trusted pharmacies.</p>
      <button v-if="cart.length > 0" @click="showCart = !showCart" class="cart-badge">
        🛒 {{ cart.length }} item{{ cart.length > 1 ? 's' : '' }} · ৳{{ cartTotal }}
      </button>
    </div>

    <!-- Cart Panel -->
    <div v-if="showCart && cart.length > 0" class="cart-panel">
      <h3>Your Cart</h3>
      <div v-for="(item, i) in cart" :key="i" class="cart-item">
        <div>
          <strong>{{ item.name }}</strong>
          <span>{{ item.quantity }} × ৳{{ item.price }}</span>
        </div>
        <button @click="removeFromCart(i)" class="remove-btn">✕</button>
      </div>
      <div class="cart-total">Total: <strong>৳{{ cartTotal }}</strong></div>

      <div class="checkout-form">
        <input v-model="deliveryAddress" placeholder="Delivery address" class="input" />
        <input v-model="deliveryPhone" placeholder="Contact phone" class="input" />
        <button @click="placeOrder" :disabled="ordering || !deliveryAddress || !deliveryPhone" class="btn-order">
          {{ ordering ? 'Placing order...' : 'Place Order · ৳' + cartTotal }}
        </button>
        <p v-if="orderSuccess" class="success">✓ Order placed! Check Orders tab.</p>
        <p v-if="orderError" class="error">{{ orderError }}</p>
      </div>
    </div>

    <!-- Orders Tab -->
    <div class="tabs">
      <button :class="['tab', { active: tab === 'shop' }]" @click="tab = 'shop'">🛍 Shop</button>
      <button :class="['tab', { active: tab === 'orders' }]" @click="tab = 'orders'; loadOrders()">📋 My Orders</button>
    </div>

    <!-- Shop -->
    <div v-if="tab === 'shop'">
      <div class="search-bar">
        <span>🔍</span>
        <input v-model="search" placeholder="Search medicines..." class="search-input" />
        <select v-model="category" class="filter-select">
          <option value="">All</option>
          <option value="Pain Relief">Pain Relief</option>
          <option value="Gastric">Gastric</option>
          <option value="Allergy">Allergy</option>
          <option value="Antibiotic">Antibiotic</option>
          <option value="Vitamin">Vitamin</option>
          <option value="Oral Saline">Oral Saline</option>
        </select>
      </div>

      <div v-if="loading" class="state"><div class="spinner"></div></div>
      <div v-else-if="filtered.length === 0" class="state">No medicines found</div>

      <div v-for="med in filtered" :key="med.id" class="med-card">
        <div class="med-info">
          <strong>{{ med.name }}</strong>
          <span class="cat">{{ med.category }}</span>
          <span class="pharmacy">🏪 {{ med.pharmacy_name }}</span>
          <span v-if="med.requires_prescription" class="rx-badge">℞ Prescription Required</span>
        </div>
        <div class="med-price">
          <strong>৳{{ med.price }}</strong>
          <button @click="addToCart(med)" class="add-btn">+ Add</button>
        </div>
      </div>
    </div>

    <!-- Orders -->
    <div v-if="tab === 'orders'">
      <div v-if="orders.length === 0" class="state">No orders yet</div>
      <div v-for="o in orders" :key="o.id" class="order-card">
        <div class="order-header">
          <span class="badge" :class="o.status">{{ o.status }}</span>
          <span class="date">{{ fmtDate(o.created_at) }}</span>
        </div>
        <div>Total: <strong>৳{{ o.total_amount }}</strong></div>
        <div class="addr">{{ o.delivery_address }}</div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useApi } from '../composables/useApi';

const api = useApi();
const medicines = ref<any[]>([]);
const orders = ref<any[]>([]);
const loading = ref(true);
const search = ref('');
const category = ref('');
const tab = ref('shop');
const showCart = ref(false);
const cart = ref<any[]>([]);
const deliveryAddress = ref('');
const deliveryPhone = ref('');
const ordering = ref(false);
const orderSuccess = ref(false);
const orderError = ref('');

const cartTotal = computed(() => cart.value.reduce((s, i) => s + i.quantity * i.price, 0));

const filtered = computed(() => {
  let list = medicines.value;
  if (category.value) list = list.filter(m => m.category === category.value);
  if (search.value) {
    const q = search.value.toLowerCase();
    list = list.filter(m => m.name.toLowerCase().includes(q));
  }
  return list;
});

onMounted(async () => {
  try {
    const { data } = await api.get('/pharmacy/medicines');
    if (data.ok) medicines.value = data.data;
  } finally { loading.value = false; }
});

function addToCart(med: any) {
  const existing = cart.value.find(i => i.id === med.id);
  if (existing) { existing.quantity++; return; }
  cart.value.push({ id: med.id, name: med.name, price: med.price, quantity: 1, pharmacyId: med.pharmacy_id });
}

function removeFromCart(i: number) { cart.value.splice(i, 1); }

async function placeOrder() {
  if (!deliveryAddress.value || !deliveryPhone.value) return;
  ordering.value = true;
  orderError.value = '';
  orderSuccess.value = false;
  try {
    const pharmacyId = cart.value[0].pharmacyId;
    const { data } = await api.post('/pharmacy/orders', {
      pharmacyId,
      items: cart.value.map(i => ({ medicineId: i.id, quantity: i.quantity, price: i.price })),
      deliveryAddress: deliveryAddress.value,
      patientPhone: deliveryPhone.value,
    });
    if (data.ok) {
      orderSuccess.value = true;
      cart.value = [];
      deliveryAddress.value = '';
      deliveryPhone.value = '';
      showCart.value = false;
      setTimeout(() => orderSuccess.value = false, 3000);
    }
  } catch (e: any) { orderError.value = e.response?.data?.error || 'Order failed'; }
  finally { ordering.value = false; }
}

async function loadOrders() {
  try {
    const { data } = await api.get('/pharmacy/orders');
    if (data.ok) orders.value = data.data;
  } catch {}
}

function fmtDate(d: string) { return new Date(d).toLocaleDateString(); }
</script>

<style scoped>
.page-hero { margin-bottom: 18px; position: relative; }
.page-hero h1 { font-size: 24px; font-weight: 800; }
.page-hero p { font-size: 13px; color: var(--text-muted); }
.cart-badge {
  position: absolute; top: 0; right: 0;
  padding: 8px 14px; background: var(--primary); color: var(--primary-text);
  border-radius: 10px; font-weight: 700; font-size: 13px;
}
.cart-panel {
  background: var(--surface); border: 1px solid var(--border); border-radius: 16px;
  padding: 16px; margin-bottom: 16px;
}
.cart-panel h3 { margin-bottom: 10px; }
.cart-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border-light); }
.cart-item strong { display: block; font-size: 14px; }
.cart-item span { font-size: 12px; color: var(--text-muted); }
.remove-btn { color: var(--danger); font-weight: 700; padding: 4px 8px; }
.cart-total { font-weight: 700; margin: 10px 0; text-align: right; }
.checkout-form { display: flex; flex-direction: column; gap: 8px; }
.input { padding: 10px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; background: var(--bg); color: var(--text); }
.btn-order {
  padding: 12px; background: var(--primary); color: var(--primary-text);
  border-radius: 10px; font-weight: 700;
}
.btn-order:disabled { opacity: 0.5; }
.success { color: var(--success); font-size: 13px; font-weight: 600; }
.error { color: var(--danger); font-size: 13px; }
.tabs { display: flex; gap: 4px; background: var(--bg-secondary); padding: 4px; border-radius: 12px; margin-bottom: 16px; }
.tab { flex: 1; padding: 8px; border-radius: 10px; font-size: 13px; font-weight: 600; color: var(--text-muted); text-align: center; }
.tab.active { background: var(--surface); color: var(--text); box-shadow: var(--shadow-sm); }
.search-bar { display: flex; gap: 8px; align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 8px 12px; margin-bottom: 16px; }
.search-input { flex: 1; border: none; outline: none; font-size: 13px; background: transparent; color: var(--text); }
.filter-select { border: none; border-left: 1px solid var(--border); padding: 6px 8px; font-size: 12px; background: transparent; color: var(--text); }
.state { text-align: center; padding: 40px; color: var(--text-muted); }
.spinner { width: 28px; height: 28px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
.med-card { display: flex; justify-content: space-between; align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px; margin-bottom: 8px; }
.med-info strong { display: block; font-size: 14px; }
.cat { font-size: 11px; background: var(--bg-secondary); padding: 2px 8px; border-radius: 6px; margin-right: 6px; }
.pharmacy { display: block; font-size: 11px; color: var(--text-muted); margin-top: 4px; }
.rx-badge { font-size: 10px; color: var(--warning); font-weight: 600; display: block; margin-top: 2px; }
.med-price { text-align: right; }
.med-price strong { display: block; font-size: 16px; color: var(--primary); }
.add-btn { margin-top: 6px; padding: 6px 14px; background: var(--primary-bg); color: var(--primary); border-radius: 8px; font-weight: 700; font-size: 13px; }
.order-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px; margin-bottom: 8px; }
.order-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
.badge { padding: 3px 10px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
.badge.pending { background: var(--warning-bg); color: var(--warning); }
.badge.confirmed { background: var(--success-bg); color: var(--success); }
.badge.shipped { background: var(--primary-bg); color: var(--primary); }
.badge.delivered { background: var(--success-bg); color: var(--success); }
.date { font-size: 12px; color: var(--text-muted); }
.addr { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
</style>
