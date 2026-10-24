import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore.js'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/p',
      name: 'playground',
      component: () => import('../views/playground.vue'),
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guestOnly: true, hideHeader: true, hideFooter: true },
    },
    {
      path: '/cadastro',
      name: 'cadastro',
      component: () => import('../views/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/config/:id?',
      name: 'config',
      meta: { requiresAuth: true },
      component: () => import('../components/configuracao-organizador/princiapalconfigComponent.vue')
    },
  ],
})

router.beforeEach((to) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.meta.guestOnly && userStore.isAuthenticated) {
    return { name: 'home' }
  }
})

export default router
