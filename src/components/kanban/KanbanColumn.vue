<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import Draggable from 'vuedraggable'
import AppButton from '../forms/AppButton.vue'
import TaskCard from '../tasks/TaskCard.vue'
const emit = defineEmits([
  'add-task', 'open-task', 'edit-column', 'delete-column', 'move-task', 'drag-state',
])
const menuAberto = ref(null)
const arrastando = ref(false)
const colunaDestino = ref(null)
const columnsList = ref(null)
const mobile = ref(false)
let mobileQuery
let scrollFrame
let scrollDirection = 0

function updateMobile() {
  mobile.value = mobileQuery.matches
}

function scrollWhileDragging() {
  if (!arrastando.value || !scrollDirection || !columnsList.value) {
    scrollFrame = undefined
    return
  }
  columnsList.value.scrollLeft += scrollDirection * 12
  scrollFrame = requestAnimationFrame(scrollWhileDragging)
}

function updateAutoScroll(evento) {
  if (!mobile.value || !columnsList.value) return
  const original = evento.originalEvent
  const pointer = original?.touches?.[0] ?? original?.changedTouches?.[0] ?? original
  if (typeof pointer?.clientX !== 'number') return
  const bounds = columnsList.value.getBoundingClientRect()
  const edge = Math.min(80, bounds.width * 0.22)
  scrollDirection = pointer.clientX < bounds.left + edge
    ? -1
    : pointer.clientX > bounds.right - edge
      ? 1
      : 0
  if (scrollDirection && !scrollFrame) scrollFrame = requestAnimationFrame(scrollWhileDragging)
}

function iniciarArraste() {
  menuAberto.value = null
  arrastando.value = true
  emit('drag-state', true)
}

function terminarArraste() {
  arrastando.value = false
  colunaDestino.value = null
  scrollDirection = 0
  if (scrollFrame) cancelAnimationFrame(scrollFrame)
  scrollFrame = undefined
  emit('drag-state', false)
}

function indicarDestino(evento) {
  if (props.arrasteDesabilitado) return false
  updateAutoScroll(evento)
  colunaDestino.value = Number(evento.to.dataset.colunaId)
  return true
}

function moverTarefa(evento, colunaId) {
  if (!evento.added || props.arrasteDesabilitado) return
  emit('move-task', { tarefaId: evento.added.element.id, statusId: colunaId })
}

function abrirTarefa(id) {
  if (!arrastando.value && !props.desabilitado) emit('open-task', id)
}

function escolherOpcao(acao, colunaId) {
  menuAberto.value = null
  emit(acao, colunaId)
}

function fecharMenu(evento) {
  if (!evento.target.closest('.column-configs')) menuAberto.value = null
}

onMounted(() => {
  mobileQuery = window.matchMedia('(max-width: 760px)')
  updateMobile()
  mobileQuery.addEventListener('change', updateMobile)
  document.addEventListener('pointerdown', fecharMenu)
})
onUnmounted(() => {
  document.removeEventListener('pointerdown', fecharMenu)
  mobileQuery?.removeEventListener('change', updateMobile)
  if (scrollFrame) cancelAnimationFrame(scrollFrame)
})

const props = defineProps({
  kabanCategories: {
    type: Array,
    required: true,
  },

  tasks: {
    type: Array,
    required: true,
  },
  podeExcluir: Boolean,
  desabilitado: Boolean,
  arrasteDesabilitado: Boolean,
})
</script>

<template>
  <ul
    ref="columnsList"
    class="columns-list"
    :style="{ '--column-count': props.kabanCategories.length }"
    @keydown.esc="menuAberto = null"
  >
    <li
      v-for="c in props.kabanCategories"
      :key="c.id"
      class="kanban-column"
      :class="{ 'column-drop-target': colunaDestino === c.id }"
      :style="{ borderColor: c.styleColor }"
    >
      <div class="column-header">
        <div class="column-title" :style="{ color: c.styleColor }">
          <h3 style="font-weight: 500">{{ c.title }}</h3>
          <span class="task-count">{{ c.countTask }}</span>
        </div>

        <div class="column-configs">
          <button
            type="button"
            class="add-task-icon"
            :aria-label="'Opções da coluna ' + c.title"
            :aria-expanded="menuAberto === c.id"
            :disabled="props.desabilitado"
            @click="menuAberto = menuAberto === c.id ? null : c.id"
          >
            <span class="mdi mdi-dots-vertical" aria-hidden="true" />
          </button>
          <div
            v-if="menuAberto === c.id"
            class="column-menu"
            role="group"
            :aria-label="'Ações da coluna ' + c.title"
          >
            <button
              type="button"
              :disabled="props.desabilitado"
              @click="escolherOpcao('edit-column', c.id)"
            >Editar</button>
            <button
              type="button"
              class="delete-option"
              :disabled="!props.podeExcluir || props.desabilitado"
              :title="!props.podeExcluir ? 'Mínimo de 3 colunas por projeto' : 'Excluir coluna'"
              @click="escolherOpcao('delete-column', c.id)"
            >
              Excluir
            </button>
          </div>
          <button
            type="button"
            class="add-task-icon"
            aria-label="Adicionar tarefa"
            :disabled="props.desabilitado"
            @click="emit('add-task', c.id)"
          >
            <span class="mdi mdi-plus" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Draggable
        :model-value="props.tasks.filter((task) => task.categoryId === c.id)"
        item-key="id"
        group="kanban-tarefas"
        :handle="mobile ? undefined : '.task-drag-handle'"
        :sort="false"
        :disabled="props.arrasteDesabilitado"
        :animation="180"
        :delay="mobile ? 220 : 0"
        :delay-on-touch-only="true"
        :touch-start-threshold="5"
        :scroll="true"
        :bubble-scroll="true"
        :force-fallback="mobile"
        :fallback-on-body="true"
        :fallback-tolerance="5"
        :scroll-sensitivity="80"
        :scroll-speed="16"
        ghost-class="task-ghost"
        chosen-class="task-chosen"
        class="column-tasks"
        :data-coluna-id="c.id"
        :move="indicarDestino"
        @start="iniciarArraste"
        @end="terminarArraste"
        @change="moverTarefa($event, c.id)"
      >
        <template #item="{ element: t }">
          <TaskCard
            role="button"
            tabindex="0"
            :aria-label="'Editar tarefa: ' + t.title"
            @click="abrirTarefa(t.id)"
            @keydown.enter.prevent="abrirTarefa(t.id)"
            @keydown.space.prevent="abrirTarefa(t.id)"
            :title="t.title"
            :end-date="t.endDate"
            :start-date="t.startDate"
            :categorias="t.categorias"
            :prioridade="t.prioridade"
            :atrasada="t.atrasada"
            :concluido-em="t.concluidoEm"
          />
        </template>
        <template #footer>
          <p v-if="!c.countTask" class="empty-column">Solte uma tarefa aqui</p>
        </template>
      </Draggable>

      <AppButton class="add-task-button" :disabled="props.desabilitado" @click="emit('add-task', c.id)"
        >Adicionar Tarefa <span class="mdi mdi-plus"
      /></AppButton>
    </li>
  </ul>
</template>

<style scoped>
.add-task-icon {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 0.4rem;
}
.add-task-button {
  margin-top: 1rem;
  width: 100%;
  flex-shrink: 0;
}

.column-tasks {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
  scrollbar-gutter: stable;
}

.columns-list {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(var(--column-count), minmax(17rem, 1fr));
  grid-template-rows: minmax(0, 1fr);
  overflow-x: auto;
  gap: 1rem;
  padding-inline: 0;
}

.kanban-column {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 2px solid;
  border-radius: 10px;
  padding: 1rem;
}

.column-drop-target {
  background: #eaf0f8;
  outline: 2px dashed var(--primaria);
  outline-offset: -7px;
}

.empty-column {
  padding: 1rem;
  color: #777;
  font-size: 0.85rem;
  text-align: center;
  pointer-events: none;
}

:deep(.task-ghost) {
  opacity: 0.35;
}

:deep(.task-chosen .task-card) {
  background: #fff;
  box-shadow: 0 4px 16px rgb(0 18 40 / 20%);
  transform: none;
}

@media (max-width: 760px) {
  .columns-list {
    flex: none;
    height: min(65dvh, 560px);
    grid-template-columns: repeat(var(--column-count), minmax(82vw, 1fr));
    grid-template-rows: minmax(0, 1fr);
    scroll-snap-type: x mandatory;
    scroll-padding-inline: 1px;
    overscroll-behavior-x: contain;
    padding-bottom: 0.5rem;
  }
  .kanban-column { scroll-snap-align: start; padding: 0.875rem; }
  .column-title { gap: 0.5rem; }
  .column-title h3 { font-size: 1rem; }
  .add-task-icon { width: 44px; height: 44px; }
  .column-menu button { min-height: 44px; }
}

.column-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.column-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.column-configs {
  position: relative;
  display: flex;
  flex-shrink: 0;
  cursor: pointer;
  font-size: 1.2rem;
  color: #9a9a9a;
  transition: all 0.2s ease;
}

.column-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 5;
  width: 160px;
  padding: 0.4rem;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgb(0 18 40 / 15%);
}
.column-menu button {
  display: block;
  width: 100%;
  padding: 0.5rem;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--primaria);
  text-align: left;
  font-size: 0.9rem;
  cursor: pointer;
}
.column-menu button:hover:not(:disabled) {
  background: #f0f3f7;
}
.column-menu .delete-option {
  color: #b91c1c;
}
.column-menu button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.add-task-icon:focus-visible,
.column-menu button:focus-visible {
  outline: 2px solid var(--primaria);
  outline-offset: 2px;
}

.column-configs span:hover {
  color: #636363;
  transition: all 0.2s ease;
}
</style>
