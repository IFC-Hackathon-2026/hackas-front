
<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import api from '@/api/config'
import editarPerfilComponent from './editarPerfilComponent.vue'
import atividadePerfilComponent from './atividadePerfilComponent.vue'
import { notificacao } from '@/services/notificacaoService'

const router = useRouter()
const userStore = useUserStore()

const API_BASE_URL = api.defaults.baseURL
const aba = ref('info')
const photoFailed = ref(false)

const photoUrl = computed(() => {
  const url = userStore.user?.foto?.url

  if (!url) return ''
  if (url.startsWith('http')) return url

  return new URL(
    url,
    new URL(API_BASE_URL, window.location.origin).origin
  ).href
})

onMounted(async () => {
  try {
    await userStore.getMe()
  } catch {
    notificacao.erro('Não foi possível carregar seu perfil.')
  }
})

function sair() {
  userStore.logout()
  notificacao.informacao('Sessão encerrada.')
  router.push('/login')
}
</script>

<template>
  <section class="profile">
    <aside class="sidebar">
      <div class="sidebar-user">
        <img
          v-if="photoUrl && !photoFailed"
          :src="photoUrl"
          alt="Foto do perfil"
          class="avatar"
          @error="photoFailed = true"
        />

        <span v-else class="avatar avatar-vazio"></span>

        <div class="sidebar-info">
          <strong>{{ userStore.user?.name }}</strong>
          <span>{{ userStore.user?.email }}</span>
        </div>
      </div>

      <nav class="abas">
        <button
          type="button"
          class="aba"
          :class="{ ativa: aba === 'info' }"
          @click="aba = 'info'"
        >
          <span class="mdi mdi-account-outline"></span>
          Informações pessoais
        </button>

        <button
          type="button"
          class="aba"
          :class="{ ativa: aba === 'atividade' }"
          @click="aba = 'atividade'"
        >
          <span class="mdi mdi-chart-box-outline"></span>
          Sua atividade
        </button>
      </nav>

      <button type="button" class="sair" @click="sair">
        <span class="mdi mdi-logout"></span>
        Sair da conta
      </button>
    </aside>

    <!-- Conteúdo -->
    <nav class="mobile-profile-tabs" aria-label="Seções do perfil">
      <button type="button" :class="{ ativa: aba === 'info' }" :aria-pressed="aba === 'info'" @click="aba = 'info'">
        Informações pessoais
      </button>
      <button type="button" :class="{ ativa: aba === 'atividade' }" :aria-pressed="aba === 'atividade'" @click="aba = 'atividade'">
        Sua atividade
      </button>
    </nav>
    <div class="conteudo">
      <header class="topo">
        <button
          type="button"
          class="voltar"
          aria-label="Voltar"
          @click="router.back()"
        >
          <span class="mdi mdi-arrow-left"></span>
        </button>

        <div>
          <h1>CENTRAL DE ATIVIDADES</h1>
          <p>GERENCIE SEUS CONVITES E VEJA SEU PROGRESSO.</p>
        </div>
      </header>

      <div class="card">
        <editarPerfilComponent v-if="aba === 'info'" />
        <atividadePerfilComponent v-else />
      </div>
    </div>
    <button type="button" class="mobile-profile-logout" @click="sair">
      <span class="mdi mdi-logout" aria-hidden="true"></span>
      Sair da conta
    </button>
  </section>
</template>

<style scoped>
.profile {
  --azul: var(--primaria, #01295f);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 2rem 0 0;
  color: var(--azul);
  margin-bottom: 3rem;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-vazio {
  display: block;
  background: #d9d9d9;
}

.sidebar-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  color: #111;
}

.sidebar-info strong {
  font-size: 1rem;
}

.sidebar-info span {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.95rem;
}

.abas {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.aba {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.5rem 0.25rem;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--azul);
  font-size: 1.05rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.aba .mdi {
  font-size: 1.6rem;
}

.aba.ativa {
  border-bottom-color: var(--azul);
}

.sair {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.25rem;
  border: 0;
  background: transparent;
  color: var(--azul);
  font-size: 1.15rem;
  font-weight: 600;
  cursor: pointer;
}

.sair .mdi {
  font-size: 1.7rem;
}

.topo {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.voltar {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--azul);
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
}

.topo h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.topo p {
  margin: 0.25rem 0 0;
  color: #111;
  font-size: 0.95rem;
  text-transform: uppercase;
}

.card {
  padding: 1.5rem;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 8px 24px rgb(0 0 0 / 8%);
}


@media (min-width: 950px) {
  .profile {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    gap: 0;
    padding-top: 3rem;
    padding-bottom: 0;
  }

  .sidebar {
    position: relative;
    top: auto;
    align-self: stretch;
    height: auto;
    min-height: 0;
    width: clamp(280px, 29vw, 396px);
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    padding-right: 2rem;
    padding-bottom: 0;
    border-right: 1px solid #111;
  }

  .avatar {
    width: 96px;
    height: 96px;
  }

  .abas {
    margin-top: 1rem;
    max-width: 300px;
  }

  .sair {
    margin-top: auto;
    margin-bottom: 0;
    font-size: 1.35rem;
  }

  .conteudo {
    flex: 1;
    min-width: 0;
    padding-left: 2.5rem;
  }

  .card {
    min-height: 500px;
    height: auto;
    box-sizing: border-box;
    padding: 1.5rem 2rem 2rem;
  }

  .topo {
    margin-bottom: 4rem;
    gap: 2rem;
  }

  .sidebar-info strong,
  .sidebar-info span {
    font-size: 1.05rem;
  }
}

@media (max-width: 949px) {
  .sidebar {
    position: relative;
    padding-bottom: 4rem;
  }

  .sair {
    position: absolute;
    bottom: 0;
  }

  .conteudo {
    min-width: 0;
  }
}

@media (max-width: 480px) {
  .card {
    padding: 1rem;
  }

  .topo h1 {
    font-size: 1.5rem;
  }
}

@media (max-width: 600px) {
  .profile {
    padding-block: 1.5rem;
    gap: 1.5rem;
  }
  .sidebar-user {
    gap: 0.75rem;
  }
  .sidebar-info strong,
  .sidebar-info span {
    overflow-wrap: anywhere;
  }
  .topo {
    gap: 0.5rem;
  }
  .topo h1 {
    font-size: 1.4rem;
  }
  .topo p {
    font-size: 0.75rem;
    line-height: 1.5;
  }
  .card {
    padding: 1rem;
  }
  .card h2 {
    font-size: 1.125rem;
  }
  .voltar { min-width: 44px; min-height: 44px; flex-shrink: 0; }

}




 .mobile-profile-tabs,
.mobile-profile-logout { display: none; }

@media (max-width: 949px) {
  .profile { min-height: 0; gap: 1.25rem; padding-bottom: 0.5rem; }
  .profile > .sidebar { display: none; }
  .mobile-profile-tabs {
    display: flex;
    align-items: stretch;
    gap: 1rem;
    border-bottom: 1px solid #d9e1ec;
  }
  .mobile-profile-tabs button {
    min-height: 44px;
    padding: 0.5rem 0;
    border: 0;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: var(--azul);
    font-size: clamp(0.6875rem, 3vw, 0.8125rem);
    font-weight: 500;
    cursor: pointer;
  }
  .mobile-profile-tabs button.ativa {
    border-bottom-color: var(--azul);
    font-weight: 700;
  }
  .mobile-profile-logout {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    align-self: stretch;
    width: 100%;
    gap: 0.5rem;
    min-height: 44px;
    margin-top: -0.75rem;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--azul);
    font-size: 1rem;
    cursor: pointer;
  }
  .topo { align-items: center; gap: 0.75rem; }
  .topo .voltar { display: inline-grid; place-items: center; }
  .topo > div:last-child { min-width: 0; }
}

button:focus-visible {
  outline: 3px solid #2767aa;
  outline-offset: 3px;
}
</style>
