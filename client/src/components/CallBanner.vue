<template>
  <!-- Incoming call — visible on every authenticated screen -->
  <Transition name="banner">
    <div v-if="call.incoming.value" class="call-banner incoming" role="alert">
      <span class="pulse-dot"></span>
      <span class="banner-text">Incoming video call</span>
      <div class="banner-actions">
        <button @click="answerAndOpen" class="btn-accept">Accept</button>
        <button @click="call.decline()" class="btn-decline">Decline</button>
      </div>
    </div>
  </Transition>

  <!-- Ongoing call elsewhere — quick way back / hang up -->
  <Transition name="banner">
    <div v-if="showOngoing" class="call-banner ongoing">
      <span class="live-dot"></span>
      <span class="banner-text">Call in progress</span>
      <div class="banner-actions">
        <router-link :to="`/chat/${call.activeAppointmentId.value}`" class="btn-rejoin">Rejoin</router-link>
        <button @click="call.endCall()" class="btn-decline">End</button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCall } from '../composables/useCall';

const call = useCall();
const route = useRoute();
const router = useRouter();

const showOngoing = computed(() =>
  call.inCall.value && !call.incoming.value && route.name !== 'chat'
);

async function answerAndOpen() {
  const appointmentId = await call.accept();
  if (appointmentId) router.push(`/chat/${appointmentId}`);
}
</script>

<style scoped>
.call-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 14px;
  margin-bottom: 12px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  box-shadow: var(--shadow-md);
}
.call-banner.incoming { background: var(--primary-dark); }
.call-banner.ongoing { background: #1e293b; }
.banner-text { flex: 1; }

.pulse-dot,
.live-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.pulse-dot { background: #fff; animation: ring-pulse 1s ease-in-out infinite; }
.live-dot { background: var(--success); }
@keyframes ring-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.3); }
}

.banner-actions { display: flex; gap: 8px; }
.btn-accept,
.btn-rejoin {
  padding: 7px 16px;
  background: var(--success);
  color: #fff;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  text-decoration: none;
}
.btn-decline {
  padding: 7px 16px;
  background: var(--danger);
  color: #fff;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
}

.banner-enter-active,
.banner-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.banner-enter-from,
.banner-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
