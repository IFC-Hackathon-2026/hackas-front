<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { RouterLink } from 'vue-router'
import api from '@/api/config'

const userStore = useUserStore()
const isScrolled = ref(false)
const photoFailed = ref(false)
const photoUrl = computed(() => {
  const url = userStore.user?.foto?.url
  if (!url) return ''
  return new URL(url, new URL(api.defaults.baseURL, window.location.origin)).href
})

watch(photoUrl, () => {
  photoFailed.value = false
})

watch(
  () => userStore.isAuthenticated,
  async (authenticated) => {
    if (authenticated && !userStore.user) {
      try {
        await userStore.getMe()
      } catch (error) {
        console.error('Não foi possível carregar o perfil do usuário.', error)
      }
    }
  },
  { immediate: true },
)

function updateScroll() {
  isScrolled.value = window.scrollY > 0
}

onMounted(() => {
  updateScroll()
  window.addEventListener('scroll', updateScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateScroll)
})
</script>

<template>
  <header class="app-header" :class="{ 'is-scrolled': isScrolled }">
    <img class="header-logo" src="/FarolFlow-logo-light.svg" alt="Logo Farol Flow" style="width: 130px; height: auto" />

    <RouterLink v-if="!userStore.isAuthenticated" to="/login" class="botao-entrar">
      <span class="mdi mdi-login" aria-hidden="true"></span>
      <span>Entrar</span>
    </RouterLink>

    <RouterLink v-else to="/perfil" class="profile-link" aria-label="Meu perfil">
      <img
        v-if="photoUrl && !photoFailed"
        :src="photoUrl"
        alt="Foto do perfil"
        class="user-avatar"
        @error="photoFailed = true"
      />
      <span v-else class="mdi mdi-account-circle-outline" aria-hidden="true"></span>
    </RouterLink>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  box-sizing: border-box;

  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 2rem 125px;
  background-color: var(--fundo-claro);

  transition: box-shadow 200ms ease;
}

.app-header.is-scrolled {
  box-shadow: 0 4px 16px rgb(0 18 40 / 12%);
}
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-link {
  display: inline-flex;
  align-items: center;
  color: inherit;
  text-decoration: none;
  font-size: 2rem;
}

.botao-entrar {
  position: relative;
  isolation: isolate;
  overflow: hidden;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  width: 120px;
  height: 38px;
  padding: 0 12px;
  box-sizing: border-box;

  background-color: #f6f6f2;
  color: #082e64;
  border: 1px solid #082e64;
  border-radius: 6px;

  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;

  transition: color 0.4s ease;
}

.botao-entrar::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;

  background-color: #082e64;
  transform: scaleX(0);
  transform-origin: left center;

  transition: transform 0.4s ease;
}

.botao-entrar:hover::before {
  transform: scaleX(1);
}

.botao-entrar:hover {
  color: #ffffff;
}

.botao-entrar .mdi {
  font-size: 21px;
  line-height: 1;
}

@media (max-width: 600px) {
  .app-header {
    padding: 1.25rem 24px;
  }

  .botao-entrar {
    width: 105px;
    height: 36px;
    font-size: 15px;
    gap: 8px;
  }

  .botao-entrar .mdi {
    font-size: 19px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .botao-entrar,
  .botao-entrar::before {
    transition: none;
  }
}

@media (max-width: 600px) {
  .app-header {
    padding: 1rem 20px;
    gap: 1rem;
  }
  .app-header > img {
    max-width: 84px;
    flex-shrink: 0;
  }
  .botao-entrar,
  .profile-link {
    min-height: 44px;
  }
}

@media (max-width: 949px) {
  .app-header { padding: 1rem 20px; gap: 12px; }
  .header-logo { margin-right: auto; min-width: 0; }
}

@media (max-width: 600px) {
  .app-header { padding-block: 0.75rem; }
  .botao-entrar {
    width: auto;
    min-height: 34px;
    height: 34px;
    padding-inline: 10px;
    gap: 5px;
    font-size: 0.8125rem;
  }
  .botao-entrar .mdi { font-size: 1rem; }
}
</style>
