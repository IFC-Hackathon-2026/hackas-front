<script setup>
import { computed, reactive, ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useProjetoStore } from '@/stores/projetoStore'
import { useStatusStore } from '@/stores/statusStore'
import { useCategoriaStore } from '@/stores/categoriaStore'
import { useTarefaStore } from '@/stores/tarefaStore'

defineOptions({ name: 'ApiPlayground' })

const userStore = useUserStore()
const projetoStore = useProjetoStore()
const statusStore = useStatusStore()
const categoriaStore = useCategoriaStore()
const tarefaStore = useTarefaStore()
const projetoForm = reactive({ nome: '', descricao: '' })
const projetoFiltros = reactive({ search: '', meus: true, page: 1 })
const projetoId = ref('')
const projetoPhoto = ref(null)
const statusForm = reactive({ nome: '', cor: '#808080', ordem: 1, finaliza_task: false })
const categoriaForm = reactive({ nome: '', cor: '#808080' })
const tarefaForm = reactive({
  titulo: '', descricao: '', prioridade: 'media', status: '', prazo: '', categoria: [], responsavel: [],
})
const statusSelecionadoId = ref('')
const categoriaSelecionadaId = ref('')
const tarefaSelecionadaId = ref('')

const projetoSelecionadoId = computed(() => projetoStore.projetoAtual?.id ?? null)

async function carregarDadosProjeto() {
  const id = projetoSelecionadoId.value
  if (!id) throw new Error('Selecione um projeto primeiro.')
  const resultado = await run(
    () => Promise.all([
      statusStore.getStatuses(id),
      categoriaStore.getCategorias(id),
      tarefaStore.getTarefas(id, { page_size: 100 }),
    ]),
    'Status, categorias e tarefas carregados.',
  )
  if (resultado && !tarefaForm.status) tarefaForm.status = statusStore.statusInicial?.id ?? ''
}

async function salvarStatus(criar) {
  const id = projetoSelecionadoId.value
  const status = await run(
    () => criar
      ? statusStore.createStatus(id, statusForm)
      : statusStore.updateStatus(statusSelecionadoId.value, id, statusForm),
    criar ? 'Status criado.' : 'Status atualizado.',
  )
  if (status) selecionarStatus(status)
}

function selecionarStatus(status) {
  statusSelecionadoId.value = status.id
  Object.assign(statusForm, status)
}

async function excluirStatus() {
  await run(
    () => statusStore.deleteStatus(statusSelecionadoId.value, projetoSelecionadoId.value),
    'Status excluído.',
  )
  statusSelecionadoId.value = ''
}

async function salvarCategoria(criar) {
  const id = projetoSelecionadoId.value
  const categoria = await run(
    () => criar
      ? categoriaStore.createCategoria(id, categoriaForm)
      : categoriaStore.updateCategoria(categoriaSelecionadaId.value, id, categoriaForm),
    criar ? 'Categoria criada.' : 'Categoria atualizada.',
  )
  if (categoria) selecionarCategoria(categoria)
}

function selecionarCategoria(categoria) {
  categoriaSelecionadaId.value = categoria.id
  Object.assign(categoriaForm, categoria)
}

async function excluirCategoria() {
  await run(
    () => categoriaStore.deleteCategoria(categoriaSelecionadaId.value, projetoSelecionadoId.value),
    'Categoria excluída.',
  )
  categoriaSelecionadaId.value = ''
}

function tarefaPayload() {
  return {
    ...tarefaForm,
    status: tarefaForm.status || undefined,
    prazo: tarefaForm.prazo ? new Date(tarefaForm.prazo).toISOString() : null,
  }
}

async function salvarTarefa(criar) {
  const projetoId = projetoSelecionadoId.value
  const tarefa = await run(
    () => criar
      ? tarefaStore.createTarefa(projetoId, tarefaPayload())
      : tarefaStore.updateTarefa(tarefaSelecionadaId.value, projetoId, tarefaPayload()),
    criar ? 'Tarefa criada.' : 'Tarefa atualizada.',
  )
  if (tarefa) selecionarTarefa(tarefa)
}

function selecionarTarefa(tarefa) {
  tarefaSelecionadaId.value = tarefa.id
  Object.assign(tarefaForm, {
    titulo: tarefa.titulo ?? '',
    descricao: tarefa.descricao ?? '',
    prioridade: tarefa.prioridade ?? 'media',
    status: typeof tarefa.status === 'object' ? tarefa.status.id : tarefa.status,
    prazo: tarefa.prazo ? tarefa.prazo.slice(0, 16) : '',
    categoria: (tarefa.categoria ?? []).map((item) => typeof item === 'object' ? item.id : item),
    responsavel: (tarefa.responsavel ?? []).map((item) => typeof item === 'object' ? item.id : item),
  })
}

async function excluirTarefa() {
  await run(
    () => tarefaStore.deleteTarefa(tarefaSelecionadaId.value, projetoSelecionadoId.value),
    'Tarefa excluída.',
  )
  tarefaSelecionadaId.value = ''
}

async function listarProjetos() {
  await run(() => projetoStore.getProjetos({
    search: projetoFiltros.search,
    meus: projetoFiltros.meus ? 'true' : 'false',
    page: projetoFiltros.page,
  }), 'Projetos carregados.')
}

async function consultarProjeto(id = projetoId.value) {
  const projeto = await run(() => projetoStore.selecionarProjeto(id), 'Projeto carregado.')
  if (projeto) {
    projetoId.value = projeto.id
    projetoForm.nome = projeto.nome
    projetoForm.descricao = projeto.descricao
    await carregarDadosProjeto()
  }
}

async function salvarProjeto(criar) {
  await run(async () => {
    const projeto = criar
      ? await projetoStore.createProjeto(projetoForm)
      : await projetoStore.updateProjeto(projetoStore.projetoAtual.id, projetoForm)
    projetoId.value = projeto.id
    return projeto
  }, criar ? 'Projeto criado. Atualize a listagem para vê-lo.' : 'Projeto atualizado.')
}

async function excluirProjeto() {
  const id = projetoStore.projetoAtual.id
  if (!window.confirm(`Excluir o projeto ${id}? As tarefas vinculadas também serão excluídas.`)) return
  await run(async () => {
    await projetoStore.deleteProjeto(id)
    projetoId.value = ''
    projetoForm.nome = ''
    projetoForm.descricao = ''
  }, 'Projeto excluído.')
}

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
  projetoStore.reset()
  statusStore.reset()
  categoriaStore.reset()
  tarefaStore.reset()
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
        <h1>Playground das APIs</h1>
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

    <section class="spaced" aria-labelledby="projetos-title">
      <h2 id="projetos-title">API de projetos</h2>
      <p>Faça login acima para testar. Selecione um projeto para editar, enviar foto ou excluir.</p>
      <fieldset class="grid project-controls" :disabled="loading || !userStore.isAuthenticated">
        <section class="card card-wide">
          <h3>1. Listagem e busca</h3>
          <p><code>GET /projetos/?meus=true&amp;search=...</code></p>
          <form @submit.prevent="listarProjetos">
            <label>Buscar por nome ou descrição<input v-model="projetoFiltros.search" /></label>
            <label class="checkbox-label"><input v-model="projetoFiltros.meus" type="checkbox" /> Somente meus projetos</label>
            <label>Página<input v-model.number="projetoFiltros.page" type="number" min="1" required /></label>
            <button>Listar projetos</button>
          </form>
          <p>Total: {{ projetoStore.total }} · Próxima página: {{ projetoStore.next ? 'Sim' : 'Não' }}</p>
          <div class="table-wrapper">
            <table>
              <thead><tr><th>ID</th><th>Nome</th><th>Meu cargo</th><th>Participantes</th><th>Ação</th></tr></thead>
              <tbody>
                <tr v-for="projeto in projetoStore.projetos" :key="projeto.id">
                  <td>{{ projeto.id }}</td><td>{{ projeto.nome }}</td>
                  <td>{{ projeto.meu_cargo || 'Sem participação' }}</td>
                  <td>{{ projeto.total_participantes }}</td>
                  <td><button type="button" @click="consultarProjeto(projeto.id)">Selecionar</button></td>
                </tr>
                <tr v-if="!projetoStore.projetos.length"><td colspan="5">Nenhum projeto na listagem.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="card">
          <h3>2. Consultar por ID</h3>
          <p><code>GET /projetos/{id}/</code></p>
          <form @submit.prevent="consultarProjeto()">
            <label>ID<input v-model.number="projetoId" type="number" min="1" required /></label>
            <button>Consultar e selecionar</button>
          </form>
          <h3 class="spaced">3. Criar ou editar</h3>
          <p><code>POST /projetos/</code> · <code>PATCH /projetos/{id}/</code></p>
          <form @submit.prevent="salvarProjeto(true)">
            <label>Nome<input v-model="projetoForm.nome" maxlength="150" required /></label>
            <label>Descrição<textarea v-model="projetoForm.descricao" rows="4"></textarea></label>
            <button>Criar novo projeto</button>
            <button type="button" :disabled="!projetoStore.podeEditar || !projetoForm.nome.trim()" @click="salvarProjeto(false)">Salvar no projeto selecionado</button>
          </form>
        </section>

        <section class="card">
          <h3>4. Projeto selecionado</h3>
          <template v-if="projetoStore.projetoAtual">
            <p>{{ projetoStore.projetoAtual.nome }} · ID {{ projetoStore.projetoAtual.id }}</p>
            <p>Cargo: {{ projetoStore.meuCargo || 'Sem participação' }}</p>
            <p>Pode editar: {{ projetoStore.podeEditar ? 'Sim' : 'Não' }} · Pode excluir: {{ projetoStore.podeExcluir ? 'Sim' : 'Não' }}</p>
            <img v-if="projetoStore.projetoAtual.foto?.url" class="project-photo" :src="resolveMediaUrl(projetoStore.projetoAtual.foto.url)" alt="Foto do projeto" />
            <div class="photo-update">
              <label>Foto<input type="file" accept="image/png,image/jpeg" @change="projetoPhoto = $event.target.files?.[0] ?? null" /></label>
              <button type="button" :disabled="!projetoStore.podeEditar || !projetoPhoto" @click="run(() => projetoStore.updatePhoto(projetoStore.projetoAtual.id, projetoPhoto), 'Foto do projeto atualizada.')">Enviar foto</button>
              <button type="button" :disabled="!projetoStore.podeEditar" @click="run(() => projetoStore.updateProjeto(projetoStore.projetoAtual.id, { foto_attachment_key: null }), 'Foto removida do projeto.')">Remover foto</button>
              <button type="button" class="danger" :disabled="!projetoStore.podeExcluir" @click="excluirProjeto">Excluir projeto selecionado</button>
            </div>
            <h4 class="spaced">Participantes</h4>
            <ul><li v-for="participante in projetoStore.participantes" :key="participante.id">{{ participante.name }} — {{ participante.cargo }}</li></ul>
            <pre>{{ JSON.stringify(projetoStore.projetoAtual, null, 2) }}</pre>
          </template>
          <p v-else>Nenhum projeto selecionado.</p>
        </section>
      </fieldset>
    </section>

    <section class="spaced" aria-labelledby="gestao-title">
      <div class="card-heading">
        <div>
          <h2 id="gestao-title">Status, categorias e tarefas</h2>
          <p>Projeto selecionado: {{ projetoStore.projetoAtual?.nome || 'nenhum' }}</p>
        </div>
        <button
          :disabled="loading || !projetoSelecionadoId"
          @click="carregarDadosProjeto"
        >
          Recarregar dados
        </button>
      </div>

      <fieldset class="grid project-controls" :disabled="loading || !projetoSelecionadoId">
        <section class="card">
          <h3>Status</h3>
          <p><code>GET/POST/PATCH/DELETE /status/</code></p>
          <form @submit.prevent="salvarStatus(true)">
            <label>Nome<input v-model="statusForm.nome" maxlength="50" required /></label>
            <label>Cor<input v-model="statusForm.cor" type="color" required /></label>
            <label>Ordem<input v-model.number="statusForm.ordem" type="number" min="1" required /></label>
            <label class="checkbox-label">
              <input v-model="statusForm.finaliza_task" type="checkbox" /> Finaliza a tarefa
            </label>
            <button>Criar status</button>
            <button type="button" :disabled="!statusSelecionadoId" @click="salvarStatus(false)">Atualizar selecionado</button>
            <button type="button" class="danger" :disabled="!statusSelecionadoId" @click="excluirStatus">Excluir selecionado</button>
          </form>
          <ul class="select-list">
            <li v-for="status in statusStore.statusesOrdenados" :key="status.id">
              <button type="button" class="item-button" @click="selecionarStatus(status)">
                <span class="color-dot" :style="{ background: status.cor }"></span>
                {{ status.ordem }}. {{ status.nome }}{{ status.finaliza_task ? ' (final)' : '' }}
              </button>
            </li>
          </ul>
        </section>

        <section class="card">
          <h3>Categorias</h3>
          <p><code>GET/POST/PATCH/DELETE /categorias/</code></p>
          <form @submit.prevent="salvarCategoria(true)">
            <label>Nome<input v-model="categoriaForm.nome" maxlength="50" required /></label>
            <label>Cor<input v-model="categoriaForm.cor" type="color" required /></label>
            <button>Criar categoria</button>
            <button type="button" :disabled="!categoriaSelecionadaId" @click="salvarCategoria(false)">Atualizar selecionada</button>
            <button type="button" class="danger" :disabled="!categoriaSelecionadaId" @click="excluirCategoria">Excluir selecionada</button>
          </form>
          <ul class="select-list">
            <li v-for="categoria in categoriaStore.categoriasOrdenadas" :key="categoria.id">
              <button type="button" class="item-button" @click="selecionarCategoria(categoria)">
                <span class="color-dot" :style="{ background: categoria.cor }"></span>
                {{ categoria.nome }}
              </button>
            </li>
          </ul>
        </section>

        <section class="card card-wide">
          <h3>Tarefas</h3>
          <p><code>GET/POST/PATCH/DELETE /tarefas/</code></p>
          <form @submit.prevent="salvarTarefa(true)">
            <label>Título<input v-model="tarefaForm.titulo" maxlength="150" required /></label>
            <label>Descrição<textarea v-model="tarefaForm.descricao" rows="3"></textarea></label>
            <label>
              Prioridade
              <select v-model="tarefaForm.prioridade">
                <option value="baixa">Baixa</option><option value="media">Média</option>
                <option value="alta">Alta</option><option value="urgente">Urgente</option>
              </select>
            </label>
            <label>
              Status
              <select v-model="tarefaForm.status">
                <option value="">Usar status inicial do projeto</option>
                <option v-for="status in statusStore.statusesOrdenados" :key="status.id" :value="status.id">{{ status.nome }}</option>
              </select>
            </label>
            <label>Prazo<input v-model="tarefaForm.prazo" type="datetime-local" /></label>
            <fieldset class="choices">
              <legend>Categorias</legend>
              <label v-for="categoria in categoriaStore.categoriasOrdenadas" :key="categoria.id" class="checkbox-label">
                <input v-model="tarefaForm.categoria" type="checkbox" :value="categoria.id" /> {{ categoria.nome }}
              </label>
            </fieldset>
            <fieldset class="choices">
              <legend>Responsáveis</legend>
              <label v-for="participante in projetoStore.participantes" :key="participante.id" class="checkbox-label">
                <input v-model="tarefaForm.responsavel" type="checkbox" :value="participante.id" /> {{ participante.name || participante.email }}
              </label>
            </fieldset>
            <button>Criar tarefa</button>
            <button type="button" :disabled="!tarefaSelecionadaId" @click="salvarTarefa(false)">Atualizar selecionada</button>
            <button type="button" class="danger" :disabled="!tarefaSelecionadaId" @click="excluirTarefa">Excluir selecionada</button>
          </form>

          <div class="table-wrapper spaced">
            <table>
              <thead><tr><th>ID</th><th>Título</th><th>Prioridade</th><th>Status</th><th>Ação</th></tr></thead>
              <tbody>
                <tr v-for="tarefa in tarefaStore.tarefas" :key="tarefa.id">
                  <td>{{ tarefa.id }}</td><td>{{ tarefa.titulo }}</td><td>{{ tarefa.prioridade }}</td><td>{{ tarefa.status }}</td>
                  <td><button type="button" class="small" @click="selecionarTarefa(tarefa)">Selecionar</button></td>
                </tr>
                <tr v-if="!tarefaStore.tarefas.length"><td colspan="5">Nenhuma tarefa carregada.</td></tr>
              </tbody>
            </table>
          </div>
          <pre v-if="tarefaStore.tarefaAtual">{{ JSON.stringify(tarefaStore.tarefaAtual, null, 2) }}</pre>
        </section>
      </fieldset>
    </section>
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
input, textarea, select {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #aeb8c6;
  border-radius: 7px;
  background: white;
}
.project-controls { border: 0; padding: 0; margin: 1rem 0 0; min-width: 0; }
.project-controls .card { min-width: 0; }
.checkbox-label { display: flex; align-items: center; }
.checkbox-label input { width: auto; }
.project-photo { max-width: 100%; max-height: 180px; object-fit: contain; margin-top: 1rem; }
.choices { display: flex; flex-wrap: wrap; gap: 0.75rem; padding: 0.8rem; border: 1px solid #dfe3ea; border-radius: 7px; }
.select-list { display: grid; gap: 0.4rem; margin-top: 1rem; }
.item-button { display: flex; align-items: center; gap: 0.5rem; width: 100%; text-align: left; }
.color-dot { width: 0.8rem; height: 0.8rem; border-radius: 50%; }

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
