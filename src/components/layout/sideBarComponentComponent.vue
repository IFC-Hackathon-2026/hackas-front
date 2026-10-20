<script setup>
import { RouterLink } from 'vue-router';
import { useTemplateStore } from "@/store/template";
import appButtonComponent from "@/components/form/appButton.vue";
import { useAuthStore } from '@/store/authStore';

const templateStore = useTemplateStore();
const authStore = useAuthStore();
</script>

<template>
  <aside class="sidebar">
    <!-- X de fechar: aparece só no desktop -->
    <button type="button" class="close-x" @click="templateStore.sidebar = false">&times;</button>

    <nav class="sidebar-nav">
      <RouterLink to="/home-page" class="nav-link">
        <span class="mdi mdi-home-variant"></span> Página inicial
      </RouterLink>

      <RouterLink to="/team" class="nav-link">
        <span class="mdi mdi-account-group"></span> Equipes
      </RouterLink>

      <RouterLink to="/projects" class="nav-link">
        <span class="mdi mdi-laptop"></span> Projetos
      </RouterLink>

      <RouterLink to="/tutorials" class="nav-link">
        <span class="mdi mdi-play-box-multiple"></span> Tutoriais
      </RouterLink>

      <RouterLink v-if="authStore.user?.tipo == 'professor'" to="/teacher" class="nav-link">
        <span class="mdi mdi-account-tie"></span> Professor
      </RouterLink>

      <RouterLink to="/myTeams" class="nav-link">
        <span class="mdi mdi-account-group-outline"></span> Meus times
      </RouterLink>

      <RouterLink to="/about-us" class="nav-link">
        <span class="mdi mdi-information-outline"></span> Sobre Nós
      </RouterLink>
    </nav>

    <div class="sidebar-footer">
      <div class="dark-mode-toggle">
        <span class="mdi mdi-weather-night"></span>
        <span>Modo noturno</span>
        <input type="checkbox" class="toggle-checkbox" id="dark-mode" />
        <label for="dark-mode" class="toggle-label"></label>
      </div>
      <div class="close-side">
        <appButtonComponent
          label="Fechar"
          @click="templateStore.sidebar = false"
        />
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 300px;
  height: 100dvh;
  background-color: #ffffff;
  z-index: 1005;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.05);
  font-family: sans-serif;
  padding-top: 50px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 20px;
}

.sidebar-logo {
  height: 45px;
  width: auto;
}

.close-sidebar {
  background: none;
  border: none;
  font-size: 24px;
  color: #1e3a8a;
  cursor: pointer;
}

/* o X só aparece no desktop */
.close-x {
  display: none;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
  font-size: 16px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.nav-link span {
  font-size: 22px;
  color: #1e3a8a;
}

.nav-link.router-link-exact-active {
  background-color: #dbeafe;
  color: #1e3a8a;
  font-weight: 600;
}

.nav-link.router-link-exact-active span {
  color: #1e3a8a;
}

.sidebar-footer {
  padding: 24px 20px;
  border-top: 1px solid #f3f4f6;
}

.dark-mode-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #1e3a8a;
  font-weight: 500;
  font-size: 15px;
}

.dark-mode-toggle span:first-child {
  font-size: 20px;
}

.dark-mode-toggle {
  position: relative;
  width: 100%;
}

.toggle-checkbox {
  display: none;
}

.toggle-label {
  margin-left: auto;
  width: 44px;
  height: 24px;
  background-color: #d1d5db;
  border-radius: 50px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
}

.toggle-label::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s;
}

.toggle-checkbox:checked + .toggle-label {
  background-color: #1e3a8a;
}

.toggle-checkbox:checked + .toggle-label::after {
  transform: translateX(20px);
}

/* ========== DESKTOP ========== */
@media (min-width: 950px) {
  .sidebar {
    left: auto;
    right: 0;
    width: 290px;
    padding-top: 0;
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
  }

  .close-x {
    display: block;
    position: absolute;
    top: 14px;
    right: 18px;
    background: none;
    border: none;
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1;
    color: #000;
    cursor: pointer;
  }

  .sidebar-nav {
    padding: 60px 20px 0;
    gap: 6px;
  }

  .nav-link {
    gap: 14px;
    padding: 8px 10px;
    font-size: 1rem;
    font-weight: 700;
    color: var(--botao-claro, #2761aa);
  }

  .nav-link:hover {
    background-color: #f1f5f9;
  }

  /* ícone branco dentro do círculo azul */
  .nav-link span {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background-color: var(--botao-claro, #2761aa);
    color: #ffffff;
    font-size: 19px;
  }

  .nav-link.router-link-exact-active {
    background-color: #dbeafe;
    color: var(--botao-claro, #2761aa);
  }

  .nav-link.router-link-exact-active span {
    color: #ffffff;
  }

  .sidebar-footer {
    padding: 18px 20px 24px;
  }

  .dark-mode-toggle {
    gap: 12px;
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--botao-claro, #2761aa);
  }

  /* o X já fecha, então o botão "Fechar" sai */
  .close-side {
    display: none;
  }
}
</style>
