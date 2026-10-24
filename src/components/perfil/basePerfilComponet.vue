<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import UserService from '@/services/userService'
import api from '@/api/config'

const router = useRouter()
const userStore = useUserStore()
const userService = new UserService()

const API_BASE_URL = api.defaults.baseURL
const TIPOS_FOTO = ['image/jpeg', 'image/png']
const TAMANHO_MAX = 5 * 1024 * 1024

const form = reactive({ name: '', email: '' })
const fetching = ref(true)
const ready = ref(false)
const photoInput = ref(null)
const file = ref(null)
const previewUrl = ref('')
const loading = ref(false)
const error = ref('')
const message = ref('')
const aba = ref('info')

const photoFailed = ref(false)
const photoUrl = computed(() => {
  const url = userStore.user?.foto?.url
  if (!url) return ''
  if (url.startsWith('http')) return url
  return new URL(url, new URL(API_BASE_URL, window.location.origin).origin).href
})

onMounted(async () => {
  try {
    const user = await userStore.getMe()
    form.name = user.name ?? ''
    form.email = user.email ?? ''
    ready.value = true
  } catch {
    error.value = 'Não foi possível carregar seu perfil.'
  } finally {
    fetching.value = false
  }
})

onUnmounted(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

function selecionarFoto(event) {
  message.value = ''
  error.value = ''
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)

  file.value = event.target.files?.[0] ?? null
  previewUrl.value = file.value ? URL.createObjectURL(file.value) : ''
}

function limparFoto() {
  file.value = null
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
  if (photoInput.value) photoInput.value.value = ''
}

async function saveProfile() {
  if (!ready.value || fetching.value || loading.value) return
  error.value = ''
  message.value = ''
  if (!form.name.trim() || !form.email.trim()) {
    error.value = 'Preencha o nome e o e-mail.'
    return
  }
  if (file.value && !TIPOS_FOTO.includes(file.value.type)) {
    error.value = 'Selecione uma imagem JPG ou PNG.'
    return
  }
  if (file.value && file.value.size > TAMANHO_MAX) {
    error.value = 'A imagem deve ter no máximo 5MB.'
    return
  }
  loading.value = true
  try {
    const data = { name: form.name.trim(), email: form.email.trim() }
    if (file.value) {
      const { data: image } = await userService.uploadImage(file.value)
      if (!image.attachment_key) throw new Error('Upload sem chave da imagem.')
      data.foto_attachment_key = image.attachment_key
    }
    const user = await userStore.updateMe(data)
    form.name = user.name ?? ''
    form.email = user.email ?? ''
    photoFailed.value = false
    limparFoto()
    message.value = 'Perfil atualizado com sucesso.'
  } catch (requestError) {
    const data = requestError.response?.data
    const details = data && typeof data === 'object'
      ? Object.entries(data).map(([field, messages]) =>
          `${({ name: 'Nome', email: 'E-mail', foto_attachment_key: 'Foto', file: 'Foto' })[field] ?? field}: ${Array.isArray(messages) ? messages.join(' ') : messages}`,
        ).join(' ')
      : ''
    error.value = details || 'Não foi possível salvar o perfil. Tente novamente.'
  } finally {
    loading.value = false
  }
}

function sair() {
  userStore.logout()
  router.push('/login') // ajuste para a sua rota de login
}
</script>

<template>
  <section class="profile">
    <!-- Sidebar -->
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
        <button type="button" class="aba" :class="{ ativa: aba === 'info' }" @click="aba = 'info'">
          <span class="mdi mdi-account-outline"></span>
          Informações pessoais
        </button>
        <button type="button" class="aba" :class="{ ativa: aba === 'atividade' }" @click="aba = 'atividade'">
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
        <button type="button" class="voltar" aria-label="Voltar" @click="router.back()">
          <span class="mdi mdi-arrow-left"></span>
        </button>
        <div>
          <h1>Meu perfil</h1>
          <p>Gerencie suas informações e mantenha tudo atualizado.</p>
        </div>
      </header>

      <div class="card">
        <template v-if="aba === 'info'">
          <h2>Informações pessoais</h2>
          <p v-if="fetching" role="status">Carregando perfil...</p>

          <form :aria-busy="fetching || loading" @submit.prevent="saveProfile">
            <div class="campos">
              <div class="campo">
                <label for="profile-name">Nome completo</label>
                <input
                  id="profile-name"
                  v-model="form.name"
                  type="text"
                  autocomplete="name"
                  required
                  :disabled="!ready || loading"
                />
              </div>

              <div class="campo">
                <label for="profile-email">E-mail</label>
                <input
                  id="profile-email"
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  required
                  maxlength="255"
                  :disabled="!ready || loading"
                />
              </div>
            </div>

            <div class="foto-box">
              <span class="foto-titulo">Foto de perfil</span>

              <div class="foto-conteudo">
                <img
                  v-if="previewUrl || (photoUrl && !photoFailed)"
                  :src="previewUrl || photoUrl"
                  alt="Foto do perfil"
                  class="foto-preview"
                />
                <span v-else class="foto-preview foto-vazia"></span>

                <div class="foto-acoes">
                  <button
                    type="button"
                    class="btn-alterar"
                    :disabled="!ready || loading"
                    @click="photoInput.click()"
                  >
                    <span class="mdi mdi-tray-arrow-up"></span>
                    Alterar foto
                  </button>
                  <small>JPG ou PNG. Tamanho máximo de 5MB.</small>
                  <input
                    ref="photoInput"
                    id="profile-photo"
                    type="file"
                    accept="image/jpeg,image/png"
                    hidden
                    @change="selecionarFoto"
                  />
                </div>
              </div>
            </div>

            <p v-if="error" class="feedback erro" role="alert">{{ error }}</p>
            <p v-if="message" class="feedback ok" role="status">{{ message }}</p>

            <div class="rodape">
              <button type="submit" class="btn-salvar" :disabled="!ready || loading">
                {{ loading ? 'Salvando...' : 'Salvar alterações' }}
              </button>
            </div>
          </form>
        </template>

        <template v-else>
          <h2>Sua atividade</h2>
          <p class="vazio">Sua atividade aparecerá aqui.</p>
        </template>
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
  --borda: #5b7399;

  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  color: var(--azul);
}

/* ---------- Sidebar ---------- */
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

.avatar-vazio,
.foto-vazia {
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

/* ---------- Conteúdo ---------- */
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

.card h2 {
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}

form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.campos {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

label {
  color: #111;
  font-size: 1.1rem;
  font-weight: 700;
}

input[type='text'],
input[type='email'] {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid var(--borda);
  border-radius: 6px;
  background: #fff;
  color: #111;
  font-size: 1rem;
}

input:disabled {
  opacity: 0.6;
}

/* Foto */
.foto-box {
  padding: 1rem 1.5rem 1.5rem;
  border: 1px solid var(--borda);
  border-radius: 2px;
}

.foto-titulo {
  display: block;
  margin-bottom: 0.75rem;
  color: #111;
  font-size: 1.1rem;
  font-weight: 700;
}

.foto-conteudo {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.foto-preview {
  flex-shrink: 0;
  width: 104px;
  height: 104px;
  border-radius: 50%;
  object-fit: cover;
}

.foto-acoes {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}

.btn-alterar {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--borda);
  border-radius: 4px;
  background: #fff;
  color: var(--azul);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-alterar .mdi {
  font-size: 1.3rem;
}

.foto-acoes small {
  color: var(--azul);
  font-size: 0.85rem;
}

/* Feedback e botão salvar */
.feedback {
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 6px;
}

.feedback.erro {
  color: #9f1c1c;
  background: #ffeded;
}

.feedback.ok {
  color: #176b35;
  background: #eaf7ee;
}

.rodape {
  display: flex;
  justify-content: flex-end;
}

.btn-salvar {
  padding: 0.75rem 1.25rem;
  border: 0;
  border-radius: 4px;
  background: var(--azul);
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-salvar:disabled,
.btn-alterar:disabled {
  opacity: 0.6;
  cursor: default;
}

.vazio {
  color: #667085;
}

/* ---------- Desktop ---------- */
@media (min-width: 950px) {
  .profile {
    flex-direction: row;
    gap: 0;
    padding-top: 3rem;
    padding-bottom: 3rem;
  }

  .sidebar {
    position: sticky;
    top: 110px;
    align-self: flex-start;
    height: calc(100dvh - 142px);
    min-height: 480px;
    width: clamp(280px, 29vw, 396px);
    flex-shrink: 0;
    justify-content: flex-start;
    padding-right: 2rem;
    padding-bottom: 1.5rem;
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
  }

  .conteudo {
    flex: 1;
    min-width: 0;
    padding-left: 2.5rem;
  }

  .card {
    min-height: 780px;
    padding: 1.5rem 2rem 3rem;
  }

  .campos {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.5rem 3rem;
  }

  .topo {
    margin-bottom: 4rem;
    gap: 2rem;
  }

  .card h2 {
    margin-bottom: 2.5rem;
    font-size: 1.65rem;
  }

  form {
    gap: 4rem;
  }

  .foto-box {
    max-width: 776px;
    margin-top: 2rem;
    box-shadow: 0 5px 14px rgb(0 18 40 / 7%);
  }

  .sidebar-info strong,
  .sidebar-info span {
    font-size: 1.05rem;
  }

  .sair {
    font-size: 1.35rem;
  }
}

button:focus-visible,
input:focus-visible {
  outline: 3px solid #2767aa;
  outline-offset: 3px;
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
  .foto-conteudo {
    align-items: flex-start;
    flex-direction: column;
  }

  .foto-box,
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
  .campo,
  .foto-acoes {
    min-width: 0;
  }
  label,
  .foto-titulo {
    font-size: 0.9375rem;
  }
  .foto-box {
    padding: 1rem;
  }
  .foto-conteudo {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .foto-preview {
    width: 80px;
    height: 80px;
  }
  .btn-salvar {
    width: 100%;
  }
  .btn-salvar,
  .btn-alterar,
  .aba,
  .sair,
  .voltar {
    min-height: 44px;
  }
  .voltar {
    min-width: 44px;
    flex-shrink: 0;
  }
  .feedback {
    overflow-wrap: anywhere;
    font-size: 0.875rem;
  }
}



@media (max-width: 600px) {
  .foto-conteudo {
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
  }
  .foto-preview {
    width: 48px;
    height: 48px;
  }
  .foto-acoes { flex: 1; gap: 0.375rem; }
  .btn-alterar {
    padding: 0.375rem 0.5rem;
    gap: 0.375rem;
    font-size: 0.8125rem;
  }
  .btn-alterar .mdi { font-size: 1rem; }
  .foto-acoes small { font-size: 0.6875rem; }
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
</style>
