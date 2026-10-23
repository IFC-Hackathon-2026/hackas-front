<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import LogoLight from '/FarolFlow-logo-light.svg'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import api from '@/api/config'

const router = useRouter()
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

watch(() => userStore.isAuthenticated, async (authenticated) => {
  if (authenticated && !userStore.user) {
    try {
      await userStore.getMe()
    } catch (error) {
      console.error('Não foi possível carregar o perfil do usuário.', error)
    }
  }
}, { immediate: true })

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
    <img :src="LogoLight" alt="logo" style="width: 130px; height: auto" />
    <img
      v-if="photoUrl && !photoFailed"
      :src="photoUrl"
      alt="Foto do perfil"
      class="user-avatar"
      @error="photoFailed = true"
       @click="router.push('/perfil')"
    />
    <span v-else class="mdi mdi-account-circle-outline" style="font-size: 2rem" @click="router.push('/perfil')"></span>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
  background-color: var(--fundo-claro);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem var(--page-padding);
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
</style>
