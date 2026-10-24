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
import TaskForm from '../tasks/TaskForm.vue'

const projetoStore = useProjetoStore()
const tarefaStore = useTarefaStore()
const statusStore = useStatusStore()
const categoriaStore = useCategoriaStore()
const selectedProject = ref(projetoStore.projetoAtual?.id ?? '')
const showModal = ref(false)
const loading = ref(false)
const error = ref('')
const notice = ref('')
let request = 0
const { filtros } = storeToRefs(tarefaStore)
const buscando = ref(false)
const erroBusca = ref('')
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
    if (versao === versaoBusca)
      erroBusca.value = 'Não foi possível filtrar as tarefas. Tente novamente.'
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
    if (loading.value) return
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
    categorias: (task.categoria ?? [])
      .map((categoria) =>
        typeof categoria === 'object'
          ? categoria
          : categoriaStore.categorias.find((item) => item.id === categoria),
      )
      .filter(Boolean),
  })),
)
const kabanCategories = computed(() =>
  statusStore.statusesOrdenados.map((status) => ({
    id: status.id,
    title: status.nome,
    styleColor: status.cor,
    countTask: tasks.value.filter((task) => task.categoryId === status.id).length,
  })),
)
async function loadProject() {
  const current = ++request
  clearTimeout(tempoBusca)
  versaoBusca++
  buscando.value = false
  erroBusca.value = ''
  loading.value = Boolean(selectedProject.value)
  showModal.value = false
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
    if (current === request) error.value = 'Não foi possível carregar o projeto.'
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
  } finally {
    loading.value = false
  }
}
onMounted(loadProjects)
function openTask(statusId) {
  if (loading.value || tarefaStore.loading || !selectedProject.value) return
  tarefaStore.resetTarefa(Number(selectedProject.value), statusId)
  showModal.value = true
}
async function saved() {
  showModal.value = false
  notice.value = 'Tarefa criada com sucesso.'
  await buscarTarefas()
}
</script>

<template>
  <section class="kanban-board">
    <div class="section-header">
      <h2>Kanban</h2>
      <p>Organize tarefas, defina prioridades e acompanhe o progresso do projeto.</p>
      <label class="project-select"
        >Projeto
        <select v-model="selectedProject" :disabled="loading || showModal" @change="loadProject">
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
      :desabilitado="!selectedProject || loading"
    />
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
    <KanbanColumn v-else :kaban-categories="kabanCategories" :tasks="tasks" @add-task="openTask" />
    <AppModal v-model:visible="showModal" title="Nova tarefa">
      <TaskForm v-if="showModal" @saved="saved" />
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
