import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('../pages/LandingPage.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../pages/RegisterPage.vue'),
      meta: { guest: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/LoginPage.vue'),
      meta: { guest: true },
    },
    {
      path: '/otp-verify',
      name: 'otp-verify',
      component: () => import('../pages/OtpVerifyPage.vue'),
      meta: { guest: true },
    },
    {
      path: '/timeline',
      name: 'timeline',
      component: () => import('../pages/TimelinePage.vue'),
      meta: { auth: true },
    },
    {
      path: '/upload',
      name: 'upload',
      component: () => import('../pages/UploadPrescriptionPage.vue'),
      meta: { auth: true },
    },
    {
      path: '/prescriptions/:id',
      name: 'prescription-detail',
      component: () => import('../pages/PrescriptionDetailPage.vue'),
      meta: { auth: true },
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('../pages/ReportsPage.vue'),
      meta: { auth: true },
    },
    {
      path: '/reminders',
      name: 'reminders',
      component: () => import('../pages/RemindersPage.vue'),
      meta: { auth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../pages/ProfilePage.vue'),
      meta: { auth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../pages/SettingsPage.vue'),
      meta: { auth: true },
    },
    // Doctor routes
    {
      path: '/doctors',
      name: 'doctors',
      component: () => import('../pages/DoctorListPage.vue'),
      meta: { auth: true },
    },
    {
      path: '/doctors/:id',
      name: 'doctor-profile',
      component: () => import('../pages/DoctorProfilePage.vue'),
      meta: { auth: true },
    },
    {
      path: '/appointments',
      name: 'appointments',
      component: () => import('../pages/AppointmentsPage.vue'),
      meta: { auth: true },
    },
    {
      path: '/chat/:appointmentId',
      name: 'chat',
      component: () => import('../pages/ChatPage.vue'),
      meta: { auth: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../pages/DoctorDashboard.vue'),
      meta: { auth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});

router.beforeEach((to, _from) => {
  const auth = useAuthStore();

  if (to.meta.auth && !auth.isAuthenticated) {
    return '/login';
  }

  if (to.meta.guest && auth.isAuthenticated) {
    if (to.name === 'landing') return true; // allow landing even when logged in
    return '/timeline';
  }
});

export default router;
