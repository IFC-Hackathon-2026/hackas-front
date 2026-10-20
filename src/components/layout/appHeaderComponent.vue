<script setup>
import { useAuthStore } from "@/store/authStore";
import router from "@/router";
import sideBarComponent from "./sideBarComponentComponent.vue";
import { useTemplateStore } from "@/store/template";

const templateStore = useTemplateStore();
const authStore = useAuthStore();
</script>

<template>
  <div
    v-if="templateStore.sidebar"
    class="sidebar-overlay"
    @click="templateStore.sidebar = false"
  ></div>

  <header>
    <ul>
      <li>
        <span
          class="mdi mdi-menu"
          @click="templateStore.sidebar = !templateStore.sidebar"
        ></span>
      </li>
      <li @click="router.push('/home-page')">
        <picture>
          <source media="(min-width: 950px)" srcset="/img/logo/Logo-preta.png" />
          <img class="logo" src="/img/logo/logo-sem-fundo.png" alt="Logo" />
        </picture>
      </li>
      <li>
        <img
          @click="router.push('/edit')"
          v-if="authStore.user?.imagem_perfil"
          class="perfil"
          :src="authStore.user?.imagem_perfil"
          :alt="authStore.user?.name"
        />
        <span v-else class="mdi mdi-account-circle-outline"></span>
      </li>
    </ul>
  </header>

  <sideBarComponent v-if="templateStore.sidebar" />
</template>

<style scoped>
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;
  background-color: white;
  padding: 35px 5px;
  z-index: 1000;
  border-bottom: 1px solid #eee;
}

ul {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  margin: 0;
  padding: 0 15px;
}

li {
  list-style: none;
  width: 100px;
  display: flex;
  align-items: center;
}

li:first-child {
  font-size: 30px;
  justify-content: flex-start;
}

li:nth-child(2) {
  justify-content: center;
  flex-grow: 1;
}

.logo {
  height: 88px;
  width: auto;
}

li:last-child {
  font-size: 35px;
  justify-content: flex-end;
}

.perfil {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: 1px solid black;
  object-fit: cover;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100dvh;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1001;
}

/* ========== DESKTOP ========== */
@media (min-width: 950px) {
  header {
    padding: 35px 0;
  }

  ul {
    padding: 0 40px;
  }

  /* logo na esquerda */
  li:nth-child(2) {
    order: 1;
    width: auto;
    flex-grow: 1;
    justify-content: flex-start;
    cursor: pointer;
    align-items: center;
  }

  .logo {
    height: 60px;
    width: auto;
  }

  /* perfil ao lado do menu */
  li:last-child {
    order: 2;
    width: auto;
    margin-right: 20px;
    cursor: pointer;
  }

  /* menu hambúrguer na direita */
  li:first-child {
    order: 3;
    width: auto;
    justify-content: flex-end;
    font-size: 40px;
    color: var(--principal-claro);
    cursor: pointer;
  }
}
</style>
