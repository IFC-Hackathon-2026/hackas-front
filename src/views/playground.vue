<script setup>
import { computed, reactive, ref } from 'vue'
import { prioridades } from '@/constants/prioridades'
import { useUserStore } from '@/stores/userStore'
import { useProjetoStore } from '@/stores/projetoStore'
import { useStatusStore } from '@/stores/statusStore'
import { useCategoriaStore } from '@/stores/categoriaStore'
import { useTarefaStore } from '@/stores/tarefaStore'
import { useDocumentoStore } from '@/stores/documentoStore'
import { usePedidoParticipacaoStore } from '@/stores/pedidoParticipacaoStore'
import KanbanBoard from '@/components/kanban/KanbanBoard.vue'

defineOptions({ name: 'ApiPlayground' })

const userStore = useUserStore()
const projetoStore = useProjetoStore()
const statusStore = useStatusStore()
const categoriaStore = useCategoriaStore()
const tarefaStore = useTarefaStore()
const documentoStore = useDocumentoStore()
const pedidoStore = usePedidoParticipacaoStore()
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
const somenteTarefasAtrasadas = ref(false)
const documentoSelecionadoId = ref('')
const documentoArquivo = ref(null)
const documentoBusca = ref('')
const documentoForm = reactive({ nome: '', tarefa: '', description: '' })
const pedidoFiltros = reactive({ status: 'pendente', tipo: '', projeto: '' })
const conviteUsuarioId = ref('')

const projetoSelecionadoId = computed(() => projetoStore.projetoAtual?.id ?? null)

async function carregarDadosProjeto() {
  const id = projetoSelecionadoId.value
  if (!id) throw new Error('Selecione um projeto primeiro.')
  const resultado = await run(
    () => Promise.all([
      statusStore.getStatuses(id),
      categoriaStore.getCategorias(id),
      tarefaStore.getTarefas(id, {
        page_size: 100,
        atrasadas: somenteTarefasAtrasadas.value ? 'true' : undefined,
      }),
      documentoStore.getDocumentos(id, { page_size: 100 }),
    ]),
    'Status, categorias, tarefas e documentos carregados.',
  )
  if (resultado && !tarefaForm.status) tarefaForm.status = statusStore.statusInicial?.id ?? ''
}

async function listarTarefas() {
  await run(
    () => tarefaStore.getTarefas(projetoSelecionadoId.value, {
      page_size: 100,
      atrasadas: somenteTarefasAtrasadas.value ? 'true' : undefined,
    }),
    somenteTarefasAtrasadas.value ? 'Tarefas atrasadas carregadas.' : 'Todas as tarefas carregadas.',
  )
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
  if (tarefa) {
    selecionarTarefa(tarefa)
    await Promise.all([
      projetoStore.getProjeto(projetoId),
      userStore.getMe(),
    ])
  }
}

async function selecionarTarefa(tarefa) {
  const detalhe = tarefa.descricao === undefined
    ? await run(
      () => tarefaStore.getTarefa(tarefa.id, projetoSelecionadoId.value),
      `Detalhes da tarefa ${tarefa.id} carregados.`,
    )
    : tarefa
  if (!detalhe) return
  tarefaSelecionadaId.value = tarefa.id
  Object.assign(tarefaForm, {
    titulo: detalhe.titulo ?? '',
    descricao: detalhe.descricao ?? '',
    prioridade: detalhe.prioridade ?? 'media',
    status: typeof detalhe.status === 'object' ? detalhe.status.id : detalhe.status,
    prazo: detalhe.prazo ? detalhe.prazo.slice(0, 16) : '',
    categoria: (detalhe.categoria ?? []).map((item) => typeof item === 'object' ? item.id : item),
    responsavel: (detalhe.responsavel ?? []).map((item) => typeof item === 'object' ? item.id : item),
  })
}

async function excluirTarefa() {
  const excluida = await run(
    () => tarefaStore.deleteTarefa(tarefaSelecionadaId.value, projetoSelecionadoId.value),
    'Tarefa excluída.',
  )
  if (excluida !== null) {
    await Promise.all([
      projetoStore.getProjeto(projetoSelecionadoId.value),
      userStore.getMe(),
    ])
  }
  tarefaSelecionadaId.value = ''
}

async function listarDocumentos() {
  await run(
    () => documentoStore.getDocumentos(projetoSelecionadoId.value, {
      page_size: 100,
      search: documentoBusca.value,
    }),
    'Documentos carregados.',
  )
}

async function criarDocumento() {
  if (!documentoArquivo.value) {
    error.value = 'Selecione um arquivo PDF.'
    return
  }
  const documento = await run(
    () => documentoStore.uploadAndCreate({
      file: documentoArquivo.value,
      nome: documentoForm.nome,
      tarefa: documentoForm.tarefa,
      description: documentoForm.description,
    }),
    'Documento enviado e vinculado à tarefa.',
  )
  if (documento) selecionarDocumento(documento)
}

async function atualizarDocumento() {
  const documento = await run(
    () => documentoStore.updateDocumento(documentoSelecionadoId.value, {
      nome: documentoForm.nome,
      tarefa: documentoForm.tarefa,
    }),
    'Documento atualizado.',
  )
  if (documento) selecionarDocumento(documento)
}

function selecionarDocumento(documento) {
  documentoSelecionadoId.value = documento.id
  documentoForm.nome = documento.nome ?? ''
  documentoForm.tarefa = documento.tarefa_origem?.id ?? ''
  documentoForm.description = documento.arquivo?.description ?? ''
}

async function excluirDocumento() {
  await run(
    () => documentoStore.deleteDocumento(documentoSelecionadoId.value),
    'Documento excluído.',
  )
  documentoSelecionadoId.value = ''
}

function selecionarArquivoDocumento(event) {
  documentoArquivo.value = event.target.files?.[0] ?? null
}

async function listarProjetos() {
  await run(() => projetoStore.getProjetos({
    search: projetoFiltros.search,
    meus: projetoFiltros.meus ? 'true' : 'false',
    page: projetoFiltros.page,
  }), 'Projetos carregados.')
}

async function solicitarEntrada(projeto) {
  const pedido = await run(
    () => pedidoStore.solicitarEntrada(projeto.id),
    `Solicitação enviada para o projeto “${projeto.nome}”.`,
  )
  if (pedido) await userStore.getMe()
}

async function listarPedidos() {
  const params = {
    status: pedidoFiltros.status || undefined,
    tipo: pedidoFiltros.tipo || undefined,
    projeto: pedidoFiltros.projeto || undefined,
    page_size: 100,
  }
  await run(() => pedidoStore.getPedidos(params), 'Pedidos e convites carregados.')
}

async function carregarMeusConvites() {
  Object.assign(pedidoFiltros, { status: 'pendente', tipo: 'convite', projeto: '' })
  await listarPedidos()
}

async function convidarUsuario() {
  const projeto = projetoStore.projetoAtual
  const pedido = await run(
    () => pedidoStore.convidarUsuario(projeto.id, conviteUsuarioId.value),
    'Convite enviado ao usuário.',
  )
  if (pedido) conviteUsuarioId.value = ''
}

function cargoNoProjeto(projetoId) {
  if (String(projetoStore.projetoAtual?.id) === String(projetoId)) return projetoStore.meuCargo
  return projetoStore.projetos.find((item) => String(item.id) === String(projetoId))?.meu_cargo
}

function podeResponderPedido(pedido) {
  if (pedido.status !== 'pendente') return false
  if (pedido.tipo === 'convite') return pedido.usuario_detalhe?.id === userStore.user?.id
  return ['fundador', 'organizador'].includes(cargoNoProjeto(pedido.projeto_detalhe?.id))
}

async function responderPedido(pedido, aceitar) {
  const resultado = await run(
    () => aceitar ? pedidoStore.aceitarPedido(pedido.id) : pedidoStore.recusarPedido(pedido.id),
    aceitar ? 'Pedido aceito.' : 'Pedido recusado.',
  )
  if (resultado && aceitar) {
    const atualId = projetoStore.projetoAtual?.id
    await Promise.all([
      userStore.getMe(),
      projetoStore.getProjetos({ meus: 'true' }),
      atualId ? projetoStore.selecionarProjeto(atualId) : Promise.resolve(),
    ])
  }
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

async function alterarCargoParticipante(participante, cargo) {
  await run(
    () => projetoStore.updateParticipante(participante.participacaoId, cargo),
    cargo === 'organizador' ? 'Membro promovido a organizador.' : 'Organizador alterado para membro.',
  )
}

async function removerParticipante(participante) {
  if (!window.confirm(`Remover ${participante.name || participante.email} do projeto?`)) return
  await run(
    () => projetoStore.deleteParticipante(participante.participacaoId),
    'Participante removido do projeto.',
  )
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
  const stage = requestError.documentoStage ? `Falha no ${requestError.documentoStage}:\n` : ''
  if (typeof data === 'string' && data.trimStart().startsWith('<!DOCTYPE html>')) {
    const status = requestError.response?.status
    const endpoint = requestError.config?.url ?? 'endpoint solicitado'
    return `${stage}A API respondeu ${status ?? 'com erro'} para ${endpoint}. Verifique se a versão atual do back foi publicada.`
  }
  if (data) return `${stage}${JSON.stringify(data, null, 2)}`
  return `${stage}${requestError.message ?? 'Erro desconhecido'}`
}

async function carregarSessao() {
  Object.assign(pedidoFiltros, { status: 'pendente', tipo: '', projeto: '' })
  const resultados = await Promise.allSettled([
    pedidoStore.getPendentes({ page_size: 100 }),
    projetoStore.getProjetos({ meus: 'false', page_size: 100 }),
  ])
  const [pedidos, projetos] = resultados
  if (pedidos.status === 'rejected') {
    const status = pedidos.reason.response?.status
    message.value = `Login realizado. A API de convites respondeu ${status ?? 'com erro'}; verifique o deploy e a migration 0017.`
  }
  if (projetos.status === 'rejected') {
    error.value = getErrorMessage(projetos.reason)
  }
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
  const usuario = await run(async () => {
    pedidoStore.reset()
    projetoStore.reset()
    statusStore.reset()
    categoriaStore.reset()
    tarefaStore.reset()
    documentoStore.reset()
    return userStore.login(loginForm.email, loginForm.password)
  },
    'Login realizado e usuário carregado.',
  )
  if (usuario) await carregarSessao()
}

async function register() {
  const usuario = await run(async () => {
      await userStore.register(
        registerForm.email,
        registerForm.password,
        registerForm.name,
        registerForm.foto,
      )
      pedidoStore.reset()
      projetoStore.reset()
      return userStore.user
    },
    'Usuário cadastrado e autenticado.',
  )
  if (usuario) await carregarSessao()
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
  documentoStore.reset()
  pedidoStore.reset()
  selectedUser.value = null
  message.value = 'Sessão encerrada.'
  error.value = ''
}
</script>

<template>
  <main class="playground">
    <KanbanBoard />
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
        <p v-if="userStore.user">
          Tarefas do perfil — progresso: {{ userStore.resumoTarefas.progresso }}% ·
          concluídas: {{ userStore.resumoTarefas.concluidas }} ·
          não concluídas: {{ userStore.resumoTarefas.nao_concluidas }} ·
          atrasadas: {{ userStore.resumoTarefas.atrasadas }}
        </p>
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
                  <td>
                    <button type="button" @click="consultarProjeto(projeto.id)">Selecionar</button>
                    <button
                      v-if="!projeto.meu_cargo"
                      type="button"
                      class="small"
                      @click="solicitarEntrada(projeto)"
                    >Pedir entrada</button>
                  </td>
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
            <template v-if="projetoStore.projetoAtual.resumo_tarefas">
              <h4 class="spaced">Resumo do dashboard</h4>
              <p>
                Progresso: {{ projetoStore.resumoTarefas.progresso }}% ·
                Atrasadas: {{ projetoStore.resumoTarefas.atrasadas }} ·
                Concluídas: {{ projetoStore.resumoTarefas.concluidas }} ·
                Não concluídas: {{ projetoStore.resumoTarefas.nao_concluidas }}
              </p>
              <ul>
                <li v-for="item in projetoStore.desempenhoParticipantes" :key="item.usuario.id">
                  {{ item.usuario.name || item.usuario.email }} —
                  atrasadas: {{ item.atrasadas }} · concluídas: {{ item.concluidas }}
                </li>
              </ul>
            </template>
            <img v-if="projetoStore.projetoAtual.foto?.url" class="project-photo" :src="resolveMediaUrl(projetoStore.projetoAtual.foto.url)" alt="Foto do projeto" />
            <div class="photo-update">
              <label>Foto<input type="file" accept="image/png,image/jpeg" @change="projetoPhoto = $event.target.files?.[0] ?? null" /></label>
              <button type="button" :disabled="!projetoStore.podeEditar || !projetoPhoto" @click="run(() => projetoStore.updatePhoto(projetoStore.projetoAtual.id, projetoPhoto), 'Foto do projeto atualizada.')">Enviar foto</button>
              <button type="button" :disabled="!projetoStore.podeEditar" @click="run(() => projetoStore.updateProjeto(projetoStore.projetoAtual.id, { foto_attachment_key: null }), 'Foto removida do projeto.')">Remover foto</button>
              <button type="button" class="danger" :disabled="!projetoStore.podeExcluir" @click="excluirProjeto">Excluir projeto selecionado</button>
            </div>
            <h4 class="spaced">Participantes</h4>
            <p><code>PATCH/DELETE /projetos/{id}/participantes/{participacao_id}/</code></p>
            <ul>
              <li v-for="participante in projetoStore.participantes" :key="participante.id">
                {{ participante.name || participante.email }} — {{ participante.cargo }}
                <template v-if="projetoStore.podeGerenciarParticipantes && participante.cargo !== 'fundador'">
                  <button
                    v-if="participante.cargo === 'membro'"
                    type="button"
                    class="small"
                    @click="alterarCargoParticipante(participante, 'organizador')"
                  >Promover</button>
                  <button
                    v-else
                    type="button"
                    class="small"
                    @click="alterarCargoParticipante(participante, 'membro')"
                  >Tornar membro</button>
                  <button type="button" class="small danger" @click="removerParticipante(participante)">Remover</button>
                </template>
              </li>
            </ul>
            <pre>{{ JSON.stringify(projetoStore.projetoAtual, null, 2) }}</pre>
          </template>
          <p v-else>Nenhum projeto selecionado.</p>
        </section>
      </fieldset>
    </section>

    <section class="spaced" aria-labelledby="pedidos-title">
      <div class="card-heading">
        <div>
          <h2 id="pedidos-title">Pedidos de entrada e convites</h2>
          <p>Um usuário pede entrada em um projeto; um organizador também pode convidá-lo. A participação só nasce depois do aceite.</p>
        </div>
        <div>
          <button :disabled="loading || !userStore.isAuthenticated" @click="carregarMeusConvites">Meus convites pendentes</button>
          <button :disabled="loading || !userStore.isAuthenticated" @click="listarPedidos">Recarregar filtros</button>
        </div>
      </div>

      <fieldset class="grid project-controls" :disabled="loading || !userStore.isAuthenticated">
        <section class="card">
          <h3>1. Consultar pendências</h3>
          <p><code>GET /pedidos-participacao/</code></p>
          <form @submit.prevent="listarPedidos">
            <label>Status
              <select v-model="pedidoFiltros.status">
                <option value="">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="aceito">Aceito</option>
                <option value="recusado">Recusado</option>
                <option value="removido">Removido da equipe</option>
              </select>
            </label>
            <label>Tipo
              <select v-model="pedidoFiltros.tipo">
                <option value="">Todos</option>
                <option value="solicitacao">Solicitação de entrada</option>
                <option value="convite">Convite do projeto</option>
              </select>
            </label>
            <label>Projeto (opcional)<input v-model.number="pedidoFiltros.projeto" type="number" min="1" /></label>
            <button>Consultar</button>
          </form>
          <p>Convites nesta consulta: {{ pedidoStore.convites.length }}</p>
          <p>Solicitações nesta consulta: {{ pedidoStore.solicitacoes.length }}</p>
        </section>

        <section class="card">
          <h3>2. Convidar usuário</h3>
          <p><code>POST /pedidos-participacao/</code></p>
          <p>Selecione antes um projeto em que você seja fundador ou organizador.</p>
          <form @submit.prevent="convidarUsuario">
            <label>Projeto<input :value="projetoStore.projetoAtual?.nome || 'Nenhum projeto selecionado'" disabled /></label>
            <label>Usuário
              <select v-model="conviteUsuarioId" required>
                <option value="" disabled>Selecione um usuário</option>
                <option
                  v-for="usuario in userStore.users.filter((item) => !projetoStore.participantes.some((participante) => participante.id === item.id))"
                  :key="usuario.id"
                  :value="usuario.id"
                >{{ usuario.name || usuario.email }} (ID {{ usuario.id }})</option>
              </select>
            </label>
            <button type="button" @click="run(() => userStore.getAllUsers(), 'Usuários carregados.')">Carregar usuários</button>
            <button :disabled="!projetoStore.podeEditar || !conviteUsuarioId">Enviar convite</button>
          </form>
        </section>

        <section class="card card-wide">
          <h3>3. Responder</h3>
          <p><code>POST /pedidos-participacao/{id}/aceitar/</code> ou <code>recusar/</code></p>
          <div class="table-wrapper">
            <table>
              <thead><tr><th>ID</th><th>Tipo</th><th>Projeto</th><th>Usuário</th><th>Status</th><th>Ações</th></tr></thead>
              <tbody>
                <tr v-for="pedido in pedidoStore.pedidos" :key="pedido.id">
                  <td>{{ pedido.id }}</td>
                  <td>{{ pedido.tipo === 'convite' ? 'Convite' : 'Solicitação' }}</td>
                  <td>{{ pedido.projeto_detalhe?.nome }} (ID {{ pedido.projeto_detalhe?.id }})</td>
                  <td>{{ pedido.usuario_detalhe?.name || pedido.usuario_detalhe?.email }}</td>
                  <td>{{ pedido.status }}</td>
                  <td>
                    <template v-if="podeResponderPedido(pedido)">
                      <button type="button" class="small" @click="responderPedido(pedido, true)">Aceitar</button>
                      <button type="button" class="small danger" @click="responderPedido(pedido, false)">Recusar</button>
                    </template>
                    <span v-else>Somente consulta</span>
                  </td>
                </tr>
                <tr v-if="!pedidoStore.pedidos.length"><td colspan="6">Nenhum pedido encontrado com esses filtros.</td></tr>
              </tbody>
            </table>
          </div>
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
          <form class="inline-form" @submit.prevent="listarTarefas">
            <label class="checkbox-label">
              <input v-model="somenteTarefasAtrasadas" type="checkbox" /> Somente atrasadas
            </label>
            <button>Aplicar filtro</button>
          </form>
          <form @submit.prevent="salvarTarefa(true)">
            <label>Título<input v-model="tarefaForm.titulo" maxlength="150" required /></label>
            <label>Descrição<textarea v-model="tarefaForm.descricao" rows="3"></textarea></label>
            <label>
              Prioridade
              <select v-model="tarefaForm.prioridade">
                <option v-for="(prioridade, valor) in prioridades" :key="valor" :value="valor">
                  {{ prioridade.nome }}
                </option>
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
              <thead><tr><th>ID</th><th>Título</th><th>Prioridade</th><th>Criada em</th><th>Prazo</th><th>Categorias</th><th>Ação</th></tr></thead>
              <tbody>
                <tr v-for="tarefa in tarefaStore.tarefas" :key="tarefa.id">
                  <td>{{ tarefa.id }}</td>
                  <td>{{ tarefa.titulo }}</td>
                  <td>{{ tarefa.prioridade }}</td>
                  <td>{{ new Date(tarefa.criado_em).toLocaleString('pt-BR') }}</td>
                  <td>{{ tarefa.prazo ? new Date(tarefa.prazo).toLocaleString('pt-BR') : 'Sem prazo' }}</td>
                  <td>{{ tarefa.categoria?.join(', ') || 'Sem categoria' }}</td>
                  <td><button type="button" class="small" @click="selecionarTarefa(tarefa)">Selecionar</button></td>
                </tr>
                <tr v-if="!tarefaStore.tarefas.length"><td colspan="7">Nenhuma tarefa carregada.</td></tr>
              </tbody>
            </table>
          </div>
          <pre v-if="tarefaStore.tarefaAtual">{{ JSON.stringify(tarefaStore.tarefaAtual, null, 2) }}</pre>
        </section>
      </fieldset>
    </section>

    <section class="spaced" aria-labelledby="documentos-title">
      <div class="card-heading">
        <div>
          <h2 id="documentos-title">Documentos das tarefas</h2>
          <p>Envie PDFs e consulte a tarefa de origem de cada documento.</p>
        </div>
        <form class="inline-form" @submit.prevent="listarDocumentos">
          <input v-model="documentoBusca" placeholder="Buscar por documento ou tarefa" />
          <button :disabled="loading || !projetoSelecionadoId">Buscar</button>
        </form>
      </div>

      <fieldset class="grid project-controls" :disabled="loading || !projetoSelecionadoId">
        <section class="card">
          <h3>Novo documento</h3>
          <p><code>POST multipart /documentos/</code> cria o arquivo e o vincula à tarefa em uma única operação.</p>
          <form @submit.prevent="criarDocumento">
            <label>Nome<input v-model="documentoForm.nome" maxlength="200" required /></label>
            <label>
              Tarefa de origem
              <select v-model="documentoForm.tarefa" required>
                <option value="" disabled>Selecione uma tarefa</option>
                <option v-for="tarefa in tarefaStore.tarefas" :key="tarefa.id" :value="tarefa.id">
                  {{ tarefa.titulo }}
                </option>
              </select>
            </label>
            <label>Descrição do arquivo<input v-model="documentoForm.description" maxlength="255" /></label>
            <label>PDF<input type="file" accept="application/pdf" required @change="selecionarArquivoDocumento" /></label>
            <button>Enviar e vincular</button>
            <button
              type="button"
              :disabled="!documentoSelecionadoId || !documentoForm.nome || !documentoForm.tarefa"
              @click="atualizarDocumento"
            >
              Atualizar nome e tarefa
            </button>
            <button type="button" class="danger" :disabled="!documentoSelecionadoId" @click="excluirDocumento">
              Excluir selecionado
            </button>
          </form>
        </section>

        <section class="card">
          <h3>Documento selecionado</h3>
          <template v-if="documentoSelecionadoId">
            <pre>{{ JSON.stringify(documentoStore.documentos.find((item) => item.id === documentoSelecionadoId), null, 2) }}</pre>
          </template>
          <p v-else>Selecione um documento na lista.</p>
        </section>

        <section class="card card-wide">
          <div class="card-heading">
            <div>
              <h3>Lista do projeto</h3>
              <p>Total: {{ documentoStore.total }}</p>
            </div>
            <button type="button" @click="listarDocumentos">Recarregar</button>
          </div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr><th>ID</th><th>Documento</th><th>Tarefa de origem</th><th>Enviado por</th><th>Arquivo</th><th>Ação</th></tr>
              </thead>
              <tbody>
                <tr v-for="documento in documentoStore.documentos" :key="documento.id">
                  <td>{{ documento.id }}</td>
                  <td>{{ documento.nome }}</td>
                  <td>{{ documento.tarefa_origem?.titulo }} (ID {{ documento.tarefa_origem?.id }})</td>
                  <td>{{ documento.enviado_por?.name || `ID ${documento.enviado_por?.id}` }}</td>
                  <td>
                    <a v-if="documento.arquivo?.url" :href="resolveMediaUrl(documento.arquivo.url)" target="_blank" rel="noopener noreferrer">
                      Abrir PDF
                    </a>
                  </td>
                  <td><button type="button" class="small" @click="selecionarDocumento(documento)">Selecionar</button></td>
                </tr>
                <tr v-if="!documentoStore.documentos.length"><td colspan="6">Nenhum documento encontrado.</td></tr>
              </tbody>
            </table>
          </div>
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
.inline-form { display: flex; align-items: end; }
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
