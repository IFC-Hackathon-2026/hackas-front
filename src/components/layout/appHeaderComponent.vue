
<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
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

    <RouterLink to="/">
      <img
        :src="LogoLight"
        alt="FarolFlow"
        class="logo"
      />
    </RouterLink>

    <nav>
      <ul class="menu">

        <li>
          <RouterLink to="/" class="menu-link">
            Início
          </RouterLink>
        </li>

        <li>
          <RouterLink to="/aboutus" class="menu-link">
            Sobre Nós
          </RouterLink>
        </li>

      </ul>
    </nav>

    <span
      class="mdi mdi-account-circle-outline usuario"
    ></span>

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

.logo {
  width: 130px;
  height: auto;
}

.menu {
  display: flex;
  align-items: center;
  gap: 20px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-link {
  display: inline-block;
  color: #2767aa;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.menu-link:hover {
  background-color: #e8f0fa;
}

.menu-link.router-link-exact-active {
  color: #174b83;
  border-bottom: 2px solid #2767aa;
}

.usuario {
  font-size: 2rem;
  cursor: pointer;
}
</style>
