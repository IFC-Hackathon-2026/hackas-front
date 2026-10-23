<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import LogoLight from '/FarolFlow-logo-light.svg'

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
    <img :src="LogoLight" alt="logo" style="width: 130px; height: auto;">
    <span class="mdi mdi-account-circle-outline" style="font-size: 2rem;"></span>
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
</style>
