
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore.js'
import HomeView from '../views/HomeView.vue'
import EventsView from '../views/EventsView.vue'

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
      meta: { guestOnly: true },
    },
    {
      path: '/eventos',
      name: 'eventos',
      component: EventsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/eventos/:id',
      name: 'detailsEventsView',
      component: () => import('../views/detailsEventsView.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../components/atalhos/dashboardComponent.vue'),
        },
        {
          path: 'config',
          name: 'config',
          component: () => import('../components/atalhos/princiapalconfigComponent.vue'),
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: {
        guestOnly: true,
        hideHeader: true,
        hideFooter: true,
      },
    },
    {
      path: '/cadastro',
      name: 'cadastro',
      component: () => import('../views/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/dashboard/:id',
      redirect: (to) => ({ name: 'dashboard', params: { id: to.params.id } }),
    },
    {
      path: '/config/:id?',
      redirect: (to) => {
        const id = to.params.id || to.query.id
        return id ? { name: 'config', params: { id } } : { name: 'eventos' }
      },
      meta: { requiresAuth: true },
      component: () => import('../components/atalhos/princiapalconfigComponent.vue'),
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: () => import('../views/PerfilView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

function obterDestino(redirect) {
  if (
    typeof redirect === 'string' &&
    redirect.startsWith('/') &&
    !redirect.startsWith('//') &&
    !redirect.startsWith('/\\') &&
    redirect !== '/login' &&
    redirect !== '/cadastro' &&
    redirect !== '/'
  ) {
    return redirect
  }

  return '/eventos'
}

router.beforeEach((to) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.guestOnly && userStore.isAuthenticated) {
    return obterDestino(to.query.redirect)
  }
})

export default router
