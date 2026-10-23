<script setup>
import { computed, reactive, ref } from 'vue'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

const loginForm = reactive({ email: '', password: '' })
const registerForm = reactive({ name: '', email: '', password: '', foto: null })
const profileForm = reactive({ name: '', email: '' })
const profilePhoto = ref(null)

const loading = ref(false)
const message = ref('')
const error = ref('')
const selectedUser = ref(null)

const accessTokenPreview = computed(() => {
  const token = userStore.accessToken
  return token ? `${token.slice(0, 24)}...` : 'Nenhum token salvo'
})

const currentPhotoUrl = computed(() => resolveMediaUrl(userStore.user?.foto?.url))

function resolveMediaUrl(url) {
  if (!url || url.startsWith('http')) return url

  const apiUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'
  return new URL(url, apiUrl).href
}

function getErrorMessage(requestError) {
  const data = requestError.response?.data
  if (data) return JSON.stringify(data, null, 2)
  return requestError.message ?? 'Erro desconhecido'
}

async function run(action, successMessage) {
  loading.value = true
  message.value = ''
  error.value = ''

  try {
    const result = await action()
    message.value = successMessage
    return result
  } catch (requestError) {
    error.value = getErrorMessage(requestError)
    return null
  } finally {
    loading.value = false
  }
}

async function login() {
  await run(
    () => userStore.login(loginForm.email, loginForm.password),
    'Login realizado e usuário carregado.',
  )
}

async function register() {
  await run(
    () =>
      userStore.register(
        registerForm.email,
        registerForm.password,
        registerForm.name,
        registerForm.foto,
      ),
    'Usuário cadastrado e autenticado.',
  )
}

async function loadMe() {
  const user = await run(() => userStore.getMe(), 'Usuário autenticado carregado.')
  if (user) {
    profileForm.name = user.name ?? ''
    profileForm.email = user.email ?? ''
  }
}

async function updateProfile() {
  await run(
    () => userStore.updateMe({ name: profileForm.name, email: profileForm.email }),
    'Perfil atualizado.',
  )
}

async function updatePhoto() {
  if (!profilePhoto.value) {
    error.value = 'Selecione uma imagem PNG ou JPEG.'
    return
  }

  await run(() => userStore.updatePhoto(profilePhoto.value), 'Foto atualizada.')
}

async function loadUsers() {
  await run(() => userStore.getAllUsers(), 'Lista de usuários carregada.')
}

async function loadUser(id) {
  selectedUser.value = await run(
    () => userStore.getUser(id),
    `Usuário ${id} carregado.`,
  )
}

function selectRegisterPhoto(event) {
  registerForm.foto = event.target.files?.[0] ?? null
}

function selectProfilePhoto(event) {
  profilePhoto.value = event.target.files?.[0] ?? null
}

function logout() {
  userStore.logout()
  selectedUser.value = null
  message.value = 'Sessão encerrada.'
  error.value = ''
}
</script>

<template>
  <main class="playground">
    <header class="page-header">
      <div>
        <p class="eyebrow">Farol Flow</p>
        <h1>Playground da API de usuário</h1>
        <p>Use esta página para testar cada endpoint sem depender das telas finais.</p>
      </div>

      <div class="session" :class="{ online: userStore.isAuthenticated }">
        <strong>{{ userStore.isAuthenticated ? 'Autenticado' : 'Desconectado' }}</strong>
        <span>{{ accessTokenPreview }}</span>
        <button v-if="userStore.isAuthenticated" type="button" class="danger" @click="logout">
          Logout
        </button>
      </div>
    </header>

    <section v-if="message || error" class="feedback">
      <p v-if="message" class="success">{{ message }}</p>
      <pre v-if="error" class="error">{{ error }}</pre>
    </section>

    <div class="grid">
      <section class="card">
        <h2>1. Login</h2>
        <p><code>POST /token/</code></p>
        <form @submit.prevent="login">
          <label>
            E-mail
            <input v-model="loginForm.email" type="email" required />
          </label>
          <label>
            Senha
            <input v-model="loginForm.password" type="password" required />
          </label>
          <button :disabled="Boolean(loading)">
            {{ loading ? 'Aguarde...' : 'Entrar' }}
          </button>
        </form>
      </section>

      <section class="card">
        <h2>2. Cadastro</h2>
        <p><code>POST /registro/</code> e upload opcional</p>
        <form @submit.prevent="register">
          <label>
            Nome
            <input v-model="registerForm.name" type="text" required />
          </label>
          <label>
            E-mail
            <input v-model="registerForm.email" type="email" required />
          </label>
          <label>
            Senha
            <input v-model="registerForm.password" type="password" minlength="8" required />
          </label>
          <label>
            Foto opcional
            <input type="file" accept="image/png,image/jpeg" @change="selectRegisterPhoto" />
          </label>
          <button :disabled="Boolean(loading)">Cadastrar</button>
        </form>
      </section>

      <section class="card">
        <h2>3. Meu perfil</h2>
        <p><code>GET/PATCH /usuarios/me/</code></p>
        <button :disabled="Boolean(loading)" @click="loadMe">Carregar meu usuário</button>

        <form class="spaced" @submit.prevent="updateProfile">
          <label>
            Nome
            <input v-model="profileForm.name" type="text" />
          </label>
          <label>
            E-mail
            <input v-model="profileForm.email" type="email" />
          </label>
          <button :disabled="Boolean(loading) || !userStore.isAuthenticated">Atualizar perfil</button>
        </form>

        <div class="photo-update">
          <input type="file" accept="image/png,image/jpeg" @change="selectProfilePhoto" />
          <button :disabled="Boolean(loading) || !profilePhoto" @click="updatePhoto">
            Atualizar foto
          </button>
        </div>
      </section>

      <section class="card">
        <h2>4. Estado atual</h2>
        <div v-if="userStore.user" class="profile">
          <img v-if="currentPhotoUrl" :src="currentPhotoUrl" alt="Foto do usuário" />
          <div class="avatar" v-else>{{ userStore.user.name?.charAt(0) || '?' }}</div>
          <div>
            <strong>{{ userStore.user.name || 'Sem nome' }}</strong>
            <p>{{ userStore.user.email }}</p>
            <small>ID: {{ userStore.user.id }}</small>
          </div>
        </div>
        <p v-else>Nenhum usuário foi carregado.</p>
        <pre>{{ JSON.stringify(userStore.user, null, 2) }}</pre>
      </section>

      <section class="card card-wide">
        <div class="card-heading">
          <div>
            <h2>5. Usuários</h2>
            <p><code>GET /usuarios/</code> e <code>GET /usuarios/{id}/</code></p>
          </div>
          <button :disabled="Boolean(loading)" @click="loadUsers">Listar usuários</button>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr><th>ID</th><th>Nome</th><th>E-mail</th><th>Ação</th></tr>
            </thead>
            <tbody>
              <tr v-for="listedUser in userStore.users" :key="listedUser.id">
                <td>{{ listedUser.id }}</td>
                <td>{{ listedUser.name }}</td>
                <td>{{ listedUser.email }}</td>
                <td><button class="small" @click="loadUser(listedUser.id)">Consultar</button></td>
              </tr>
              <tr v-if="!userStore.users.length">
                <td colspan="4">A lista ainda não foi carregada.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <pre v-if="selectedUser">{{ JSON.stringify(selectedUser, null, 2) }}</pre>
      </section>
    </div>
  </main>
</template>

<style scoped>
.playground {
  width: min(1180px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 2rem 0 4rem;
}

.page-header,
.card-heading,
.profile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.page-header { margin-bottom: 1.5rem; }
.page-header h1 { color: var(--primaria); }
.eyebrow { color: var(--laranja); font-weight: 700; text-transform: uppercase; }

.session {
  display: grid;
  gap: 0.35rem;
  min-width: 260px;
  padding: 1rem;
  border: 1px solid #d8dde5;
  border-left: 5px solid #8b95a5;
  border-radius: 10px;
  background: white;
}
.session.online { border-left-color: var(--verde); }
.session span { max-width: 300px; color: #667085; font-family: monospace; }

.feedback { margin-bottom: 1rem; }
.success, .error { padding: 0.85rem 1rem; border-radius: 8px; white-space: pre-wrap; }
.success { color: #176b35; background: #eaf7ee; }
.error { color: #9f1c1c; background: #ffeded; }

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.card {
  padding: 1.25rem;
  border: 1px solid #dfe3ea;
  border-radius: 12px;
  background: white;
  box-shadow: 0 8px 20px rgb(0 18 40 / 6%);
}
.card-wide { grid-column: 1 / -1; }
.card h2 { color: var(--primaria); }
.card > p { margin-bottom: 1rem; color: #667085; }

form, .photo-update { display: grid; gap: 0.8rem; }
.spaced, .photo-update { margin-top: 1rem; }
label { display: grid; gap: 0.3rem; font-weight: 600; }
input {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #aeb8c6;
  border-radius: 7px;
  background: white;
}

button {
  padding: 0.7rem 1rem;
  border: 0;
  border-radius: 7px;
  color: white;
  background: var(--primaria);
  cursor: pointer;
}
button:hover { background: var(--azul-claro); }
button:disabled { opacity: 0.55; cursor: not-allowed; }
button.danger { background: #a92a2a; }
button.small { padding: 0.4rem 0.7rem; }

.profile { justify-content: flex-start; margin: 1rem 0; }
.profile img, .avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}
.avatar {
  display: grid;
  place-items: center;
  color: white;
  background: var(--azul-claro);
  font-size: 1.5rem;
  font-weight: 700;
}

pre {
  max-height: 260px;
  margin-top: 1rem;
  padding: 0.8rem;
  overflow: auto;
  border-radius: 7px;
  background: #101828;
  color: #d7e5ff;
  font-size: 0.8rem;
}

.table-wrapper { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 0.7rem; border-bottom: 1px solid #e6e9ee; text-align: left; }
th { color: var(--primaria); }

@media (max-width: 760px) {
  .page-header, .card-heading { align-items: stretch; flex-direction: column; }
  .session { min-width: 0; }
  .grid { grid-template-columns: 1fr; }
  .card-wide { grid-column: auto; }
}
</style>
