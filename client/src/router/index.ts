import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Public
    { path: '/', name: 'landing', component: () => import('../pages/LandingPage.vue'), meta: { guest: true } },
    { path: '/register', name: 'register', component: () => import('../pages/RegisterPage.vue'), meta: { guest: true } },
    { path: '/login', name: 'login', component: () => import('../pages/LoginPage.vue'), meta: { guest: true } },
    { path: '/otp-verify', name: 'otp-verify', component: () => import('../pages/OtpVerifyPage.vue'), meta: { guest: true } },

    // Patient routes
    { path: '/home', name: 'home', component: () => import('../pages/PatientDashboard.vue'), meta: { auth: true, role: 'patient' } },
    { path: '/timeline', name: 'timeline', component: () => import('../pages/TimelinePage.vue'), meta: { auth: true, role: 'patient' } },
    { path: '/upload', name: 'upload', component: () => import('../pages/UploadPrescriptionPage.vue'), meta: { auth: true, role: 'patient' } },
    { path: '/prescriptions/:id', name: 'prescription-detail', component: () => import('../pages/PrescriptionDetailPage.vue'), meta: { auth: true, role: 'patient' } },
    { path: '/reports', name: 'reports', component: () => import('../pages/ReportsPage.vue'), meta: { auth: true, role: 'patient' } },
    { path: '/doctors', name: 'doctors', component: () => import('../pages/DoctorListPage.vue'), meta: { auth: true, role: 'patient' } },
    { path: '/doctors/:id', name: 'doctor-profile', component: () => import('../pages/DoctorProfilePage.vue'), meta: { auth: true, role: 'patient' } },
    { path: '/shop', name: 'shop', component: () => import('../pages/ShopPage.vue'), meta: { auth: true } },

    // Doctor routes
    { path: '/dashboard', name: 'dashboard', component: () => import('../pages/DoctorDashboard.vue'), meta: { auth: true, role: 'doctor' } },

    // Shared (both roles)
    { path: '/appointments', name: 'appointments', component: () => import('../pages/AppointmentsPage.vue'), meta: { auth: true } },
    { path: '/chat/:appointmentId', name: 'chat', component: () => import('../pages/ChatPage.vue'), meta: { auth: true } },
    { path: '/reminders', name: 'reminders', component: () => import('../pages/RemindersPage.vue'), meta: { auth: true } },
    { path: '/profile', name: 'profile', component: () => import('../pages/ProfilePage.vue'), meta: { auth: true } },
    { path: '/settings', name: 'settings', component: () => import('../pages/SettingsPage.vue'), meta: { auth: true } },

    // Pharmacy
    { path: '/pharmacy', name: 'pharmacy', component: () => import('../pages/PharmacyPage.vue'), meta: { auth: true, role: 'pharmacy' } },

    // Catch-all
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

router.beforeEach((to, _from) => {
  const auth = useAuthStore();

  // Redirect unauthenticated
  if (to.meta.auth && !auth.isAuthenticated) {
    return '/login';
  }

  // Redirect authenticated away from guest pages
  if (to.meta.guest && auth.isAuthenticated) {
    if (to.name === 'landing') return true;
    return auth.user?.role === 'doctor' ? '/dashboard' : '/timeline';
  }

  // Role-based access
  if (to.meta.role && auth.user?.role !== to.meta.role) {
    // Redirect to appropriate home
    if (auth.user?.role === 'doctor') return '/dashboard';
    if (auth.user?.role === 'pharmacy') return '/pharmacy';
    return '/home';
  }

  // Redirect landing based on role
  if (to.name === 'timeline' && auth.user?.role === 'doctor') {
    return '/dashboard';
  }
  if (to.name === 'dashboard' && auth.user?.role === 'patient') {
    return '/timeline';
  }
});

export default router;
