
<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isScrolled = ref(false)

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
    <img
      src="/FarolFlow-logo-light.svg"
      alt="Logo Farol Flow"
      style="width: 130px; height: auto;"
    />

    <RouterLink
      v-if="!authStore.isAuthenticated"
      to="/login"
      class="botao-entrar"
    >
      <span class="mdi mdi-login" aria-hidden="true"></span>
      <span>Entrar</span>
    </RouterLink>

    <span
      v-else
      class="mdi mdi-account-circle-outline"
      style="font-size: 2rem;"
      aria-label="Usuário"
    ></span>
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
</style>
