<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useProjetoStore } from '@/stores/projetoStore'
import { useTarefaStore } from '@/stores/tarefaStore'
import { useStatusStore } from '@/stores/statusStore'
import { useCategoriaStore } from '@/stores/categoriaStore'
import KanbanColumn from './KanbanColumn.vue'
import KanbanToolBar from './KanbanToolBar.vue'
import AppModal from '../modais/AppModal.vue'
import AppConfirmModal from '../modais/AppConfirmModal.vue'
import TaskForm from '../tasks/TaskForm.vue'
import AppButton from '../forms/AppButton.vue'
import KanbanColumnForm from './KanbanColumnForm.vue'
import { apiErrorMessage } from '@/utils/apiErrorMessage'
import { notificacao } from '@/services/notificacaoService'
import { MINIMO_COLUNAS, MAXIMO_COLUNAS } from '@/constants/kanban'

const projetoStore = useProjetoStore()
const tarefaStore = useTarefaStore()
const statusStore = useStatusStore()
const categoriaStore = useCategoriaStore()
const selectedProject = ref(projetoStore.projetoAtual?.id ?? '')
const showModal = ref(false)
const openingTask = ref(false)
const arrastandoTarefa = ref(false)
const movendoTarefa = ref(false)
const taskError = ref('')
const loading = ref(false)
const error = ref('')
const notice = ref('')
const mostrarModalColuna = ref(false)
const colunaSelecionada = ref(null)
const colunaExcluir = ref(null)
const excluindoColuna = ref(false)
const erroColuna = ref('')
let request = 0
const { filtros } = storeToRefs(tarefaStore)
const buscando = ref(false)
const erroBusca = ref('')
const arrasteDesabilitado = computed(() =>
  loading.value || buscando.value || openingTask.value || movendoTarefa.value ||
  showModal.value || mostrarModalColuna.value || Boolean(colunaExcluir.value) ||
  statusStore.alterandoColuna || tarefaStore.loading,
)
let tempoBusca
let versaoBusca = 0

async function buscarTarefas() {
  if (!selectedProject.value || loading.value) return
  const versao = ++versaoBusca
  buscando.value = true
  erroBusca.value = ''
  try {
    await tarefaStore.getTarefasKanban(selectedProject.value, statusStore.statusesOrdenados)
  } catch {
    if (versao === versaoBusca) {
      erroBusca.value = 'Não foi possível filtrar as tarefas. Tente novamente.'
      notificacao.erro(erroBusca.value)
    }
  } finally {
    if (versao === versaoBusca) buscando.value = false
  }
}

watch(
  () => [
    filtros.value.search,
    [...filtros.value.categoria],
    [...filtros.value.responsavel],
    filtros.value.prioridade,
    filtros.value.atrasadas,
  ],
  () => {
    if (loading.value || movendoTarefa.value) return
    clearTimeout(tempoBusca)
    tempoBusca = setTimeout(buscarTarefas, 350)
  },
)
onUnmounted(() => clearTimeout(tempoBusca))
const date = (value) =>
  value
    ? /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? `${value.slice(8, 10)}/${value.slice(5, 7)}`
      : new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    : '—'
const tasks = computed(() =>
  tarefaStore.tarefasFiltradas.map((task) => ({
    id: task.id,
    categoryId: task.status?.id ?? task.status,
    title: task.titulo,
    startDate: date(task.criado_em),
    endDate: date(task.prazo),
    prioridade: task.prioridade,
    atrasada: !task.concluido_em && Boolean(task.atrasada || task.situacao === 'atrasada'),
    concluidoEm: task.concluido_em,
    categorias: (task.categoria ?? [])
      .map((categoria) =>
        typeof categoria === 'object'
          ? categoria
          : categoriaStore.categorias.find((item) => item.id === categoria),
      )
      .filter(Boolean),
  })).sort((a, b) => Number(b.atrasada) - Number(a.atrasada)),
)
const kabanCategories = computed(() =>
  statusStore.statusesOrdenados.map((status) => ({
    id: status.id,
    title: status.nome,
    styleColor: status.cor,
    countTask: tasks.value.filter((task) => task.categoryId === status.id).length,
  })),
)
const quantidadeColunas = computed(() => kabanCategories.value.length)
const podeExcluirColuna = computed(() => quantidadeColunas.value > MINIMO_COLUNAS)
const podeAdicionarColuna = computed(() => quantidadeColunas.value < MAXIMO_COLUNAS)
async function loadProject() {
  const current = ++request
  clearTimeout(tempoBusca)
  versaoBusca++
  buscando.value = false
  erroBusca.value = ''
  loading.value = Boolean(selectedProject.value)
  showModal.value = false
  mostrarModalColuna.value = false
  colunaExcluir.value = null
  erroColuna.value = ''
  error.value = ''
  notice.value = ''
  tarefaStore.reset()
  statusStore.reset()
  if (!selectedProject.value) return
  loading.value = true
  try {
    await projetoStore.selecionarProjeto(selectedProject.value)
    if (current !== request) return
    await Promise.all([
      statusStore.getStatuses(selectedProject.value),
      categoriaStore.getCategorias(selectedProject.value),
    ])
    if (current !== request) return
    await tarefaStore.getTarefasKanban(selectedProject.value, statusStore.statusesOrdenados)
  } catch {
    if (current === request) {
      error.value = 'Não foi possível carregar o projeto.'
      notificacao.erro(error.value)
    }
  } finally {
    if (current === request) loading.value = false
  }
}
async function loadProjects() {
  loading.value = true
  try {
    const projects = []
    let page = 1
    do {
      projects.push(...(await projetoStore.getMeusProjetos({ page, page_size: 100 })))
      page++
    } while (projetoStore.next)
    projetoStore.projetos = projects
    if (selectedProject.value) await loadProject()
  } catch {
    error.value = 'Não foi possível carregar os projetos.'
    notificacao.erro(error.value)
  } finally {
    loading.value = false
  }
}
onMounted(loadProjects)
function newTask(statusId) {
  if (movendoTarefa.value || arrastandoTarefa.value) return
  if (loading.value || openingTask.value || tarefaStore.loading || !selectedProject.value) return
  tarefaStore.resetTarefa(Number(selectedProject.value), statusId)
  showModal.value = true
}
async function openTask(taskId) {
  if (movendoTarefa.value || arrastandoTarefa.value) return
  if (loading.value || openingTask.value || showModal.value || !selectedProject.value) return
  const projectId = selectedProject.value
  const current = request
  openingTask.value = true
  taskError.value = ''
  try {
    const task = await tarefaStore.getTarefa(taskId, projectId)
    if (current !== request) return
    tarefaStore.tarefa = {
      ...task,
      categoria: [...(task.categoria ?? [])],
      responsavel: [...(task.responsavel ?? [])],
    }
    showModal.value = true
  } catch {
    if (current === request) {
      taskError.value = 'Não foi possível abrir a tarefa. Tente novamente.'
      notificacao.erro(taskError.value)
    }
  } finally {
    openingTask.value = false
  }
}
async function deleted() {
  showModal.value = false
  notice.value = 'Tarefa excluída com sucesso.'
  notificacao.sucesso(notice.value)
  await buscarTarefas()
}
async function saved() {
  showModal.value = false
  notice.value = tarefaStore.tarefa.id
    ? 'Tarefa atualizada com sucesso.'
    : 'Tarefa criada com sucesso.'
  notificacao.sucesso(notice.value)
  await buscarTarefas()
}

async function moverTarefa({ tarefaId, statusId }) {
  if (arrasteDesabilitado.value || !selectedProject.value) return
  const tarefa = tarefaStore.tarefas.find((item) => item.id === tarefaId)
  const coluna = statusStore.statuses.find((item) => item.id === statusId)
  if (!tarefa || !coluna || (tarefa.status?.id ?? tarefa.status) === statusId) return

  const tarefaAnterior = { ...tarefa }
  const projetoId = selectedProject.value
  const atual = request
  clearTimeout(tempoBusca)
  movendoTarefa.value = true
  taskError.value = ''
  notice.value = ''
  // Move o card imediatamente enquanto o backend salva o novo status.
  tarefaStore.tarefas = tarefaStore.tarefas.map((item) =>
    item.id === tarefaId ? { ...item, status: statusId } : item,
  )
  try {
    await tarefaStore.updateTarefa(tarefaId, projetoId, { status: statusId })
    if (atual !== request) return
    notice.value = `Tarefa movida para ${coluna.nome}.`
    notificacao.sucesso(notice.value)
    await buscarTarefas()
  } catch (erro) {
    if (atual !== request) return
    tarefaStore.tarefas = tarefaStore.tarefas.map((item) =>
      item.id === tarefaId ? tarefaAnterior : item,
    )
    taskError.value = apiErrorMessage(erro, 'Não foi possível mover a tarefa. Tente novamente.')
    notificacao.erro(taskError.value)
  } finally {
    movendoTarefa.value = false
  }
}

function novaColuna() {
  if (movendoTarefa.value || arrastandoTarefa.value) return
  if (!selectedProject.value || loading.value || statusStore.alterandoColuna) return
  if (!podeAdicionarColuna.value) return
  colunaSelecionada.value = null
  mostrarModalColuna.value = true
}

function editarColuna(id) {
  if (movendoTarefa.value || arrastandoTarefa.value) return
  if (loading.value || statusStore.alterandoColuna) return
  colunaSelecionada.value = statusStore.statuses.find((coluna) => coluna.id === id)
  if (colunaSelecionada.value) mostrarModalColuna.value = true
}

function confirmarExclusaoColuna(id) {
  if (movendoTarefa.value || arrastandoTarefa.value) return
  if (loading.value || statusStore.alterandoColuna) return
  if (!podeExcluirColuna.value) return
  erroColuna.value = ''
  colunaExcluir.value = statusStore.statuses.find((coluna) => coluna.id === id)
}

async function atualizarColunas(projetoId) {
  const atual = request
  try {
    await statusStore.getStatuses(projetoId)
    if (atual !== request) return
    await buscarTarefas()
  } catch {
    if (atual === request) {
      erroColuna.value = 'Não foi possível atualizar o quadro. Tente novamente.'
      notificacao.erro(erroColuna.value)
    }
  }
}

async function colunaSalva(projetoId) {
  if (String(projetoId) !== String(selectedProject.value)) return
  notice.value = colunaSelecionada.value
    ? 'Coluna atualizada com sucesso.'
    : 'Coluna criada com sucesso.'
  notificacao.sucesso(notice.value)
  mostrarModalColuna.value = false
  erroColuna.value = ''
  await atualizarColunas(projetoId)
}

async function excluirColuna() {
  if (!colunaExcluir.value || excluindoColuna.value || statusStore.alterandoColuna) return
  const projetoId = selectedProject.value
  const atual = request
  excluindoColuna.value = true
  erroColuna.value = ''
  try {
    await statusStore.deleteStatus(colunaExcluir.value.id, projetoId)
    if (atual !== request) return
    colunaExcluir.value = null
    notice.value = 'Coluna excluída com sucesso.'
    notificacao.sucesso(notice.value)
    await atualizarColunas(projetoId)
  } catch (error) {
    if (atual === request) {
      erroColuna.value = apiErrorMessage(
        error,
        error.message || 'Não foi possível excluir a coluna.',
      )
      notificacao.erro(erroColuna.value)
    }
  } finally {
    excluindoColuna.value = false
  }
}
</script>

<template>
  <section class="kanban-board">
    <div class="section-header">
      <h2>Kanban</h2>
      <p>Organize tarefas, defina prioridades e acompanhe o progresso do projeto.</p>
      <label class="project-select"
        >Projeto
        <select
          v-model="selectedProject"
          :disabled="
            loading ||
            showModal ||
            mostrarModalColuna ||
            Boolean(colunaExcluir) ||
            movendoTarefa ||
            arrastandoTarefa ||
            statusStore.alterandoColuna ||
            statusStore.loading
          "
          @change="loadProject"
        >
          <option value="">Selecione um projeto</option>
          <option v-for="project in projetoStore.projetos" :key="project.id" :value="project.id">
            {{ project.nome }}
          </option>
        </select>
      </label>
      <p v-if="notice" role="status">{{ notice }}</p>
    </div>
    <KanbanToolBar
      v-model="filtros"
      @limpar="tarefaStore.limparFiltros"
      :categorias="categoriaStore.categoriasOrdenadas"
      :usuarios="projetoStore.participantes"
      :desabilitado="!selectedProject || loading || movendoTarefa || arrastandoTarefa"
    />
    <div v-if="selectedProject && !loading" class="column-limit">
      <div class="column-summary">
        <span>{{ quantidadeColunas }}/{{ MAXIMO_COLUNAS }} colunas</span>
        <span>Mínimo de 3 e máximo de 5.</span>
      </div>
      <AppButton
        class="add-column-button"
        variant="secondary"
        :disabled="!podeAdicionarColuna || statusStore.alterandoColuna || movendoTarefa || arrastandoTarefa"
        @click="novaColuna"
      >
        <span class="mdi mdi-plus" aria-hidden="true" /> Adicionar coluna
      </AppButton>
    </div>
    <p v-if="buscando" role="status">Buscando tarefas…</p>
    <div v-if="erroBusca" role="alert">
      {{ erroBusca }} <button type="button" @click="buscarTarefas">Tentar novamente</button>
    </div>
    <p v-if="selectedProject && !loading && !buscando && !erroBusca && !tasks.length" role="status">
      Nenhuma tarefa encontrada.
    </p>
    <p v-if="loading" role="status">Carregando quadro…</p>
    <div v-else-if="error" role="alert">
      <p>{{ error }}</p>
      <button type="button" @click="selectedProject ? loadProject() : loadProjects()">
        Tentar novamente
      </button>
    </div>
    <p v-else-if="!selectedProject">Selecione um projeto para ver as tarefas.</p>
    <p v-else-if="!kabanCategories.length">Este projeto ainda não possui status cadastrados.</p>
    <KanbanColumn
      v-else
      :kaban-categories="kabanCategories"
      :tasks="tasks"
      :pode-excluir="podeExcluirColuna"
      :desabilitado="statusStore.alterandoColuna || movendoTarefa || arrastandoTarefa"
      :arraste-desabilitado="arrasteDesabilitado"
      @add-task="newTask"
      @open-task="openTask"
      @edit-column="editarColuna"
      @delete-column="confirmarExclusaoColuna"
      @move-task="moverTarefa"
      @drag-state="arrastandoTarefa = $event"
    />
    <p v-if="movendoTarefa" role="status">Salvando nova coluna da tarefa…</p>
    <p v-if="openingTask" role="status">Carregando tarefa…</p>
    <p v-if="taskError" role="alert">{{ taskError }}</p>
    <p v-if="erroColuna && !colunaExcluir" role="alert">
      {{ erroColuna }}
      <button type="button" @click="atualizarColunas(selectedProject)">Tentar novamente</button>
    </p>
    <AppModal
      v-model:visible="mostrarModalColuna"
      :title="colunaSelecionada ? 'Editar coluna' : 'Nova coluna'"
    >
      <KanbanColumnForm
        v-if="mostrarModalColuna"
        :projeto-id="selectedProject"
        :coluna="colunaSelecionada"
        @salvo="colunaSalva"
      />
    </AppModal>
    <AppConfirmModal
      :visible="Boolean(colunaExcluir)"
      titulo="Excluir coluna"
      :mensagem="
        'Tem certeza de que deseja excluir a coluna “' + (colunaExcluir?.nome ?? '') + '”?'
      "
      :carregando="excluindoColuna"
      :desabilitado="!podeExcluirColuna"
      :erro="erroColuna"
      @confirmar="excluirColuna"
      @update:visible="colunaExcluir = null"
    >
      <p>
        A coluna precisa estar vazia. Mova suas tarefas antes de excluir. O projeto deve manter pelo
        menos 3 colunas.
      </p>
    </AppConfirmModal>
    <AppModal
      v-model:visible="showModal"
      :title="tarefaStore.tarefa.id ? 'Editar tarefa' : 'Nova tarefa'"
    >
      <TaskForm v-if="showModal" @saved="saved" @deleted="deleted" />
    </AppModal>
  </section>
</template>

<style scoped>
.kanban-board {
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  padding-block: 2rem;
}
.section-header {
  margin-bottom: 1.2rem;
  flex-shrink: 0;
}
.column-limit {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
  flex-shrink: 0;
}
.column-summary {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.add-column-button {
  width: auto;
  padding-inline: 1rem;
  font-size: 0.95rem;
}
.project-select {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
}
select {
  max-width: 100%;
  padding: 0.5rem;
  border-radius: 6px;
  background: transparent;
}
</style>
