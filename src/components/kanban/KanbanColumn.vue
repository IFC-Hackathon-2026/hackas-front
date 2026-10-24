<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import AppButton from '../forms/AppButton.vue'
import TaskCard from '../tasks/TaskCard.vue'
const emit = defineEmits(['add-task', 'open-task', 'edit-column', 'delete-column'])
const menuAberto = ref(null)

function escolherOpcao(acao, colunaId) {
  menuAberto.value = null
  emit(acao, colunaId)
}

function fecharMenu(evento) {
  if (!evento.target.closest('.column-configs')) menuAberto.value = null
}

onMounted(() => document.addEventListener('pointerdown', fecharMenu))
onUnmounted(() => document.removeEventListener('pointerdown', fecharMenu))

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
})
</script>

<template>
  <ul
    class="columns-list"
    :style="{ '--column-count': props.kabanCategories.length }"
    @keydown.esc="menuAberto = null"
  >
    <li
      v-for="c in props.kabanCategories"
      :key="c.id"
      class="kanban-column"
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
            <button type="button" @click="escolherOpcao('edit-column', c.id)">Editar</button>
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
            @click="emit('add-task', c.id)"
          >
            <span class="mdi mdi-plus" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div class="column-tasks">
        <TaskCard
          v-for="t in props.tasks.filter((task) => task.categoryId === c.id)"
          :key="t.id"
          role="button"
          tabindex="0"
          :aria-label="'Editar tarefa: ' + t.title"
          @click="emit('open-task', t.id)"
          @keydown.enter.prevent="emit('open-task', t.id)"
          @keydown.space.prevent="emit('open-task', t.id)"
          :title="t.title"
          :end-date="t.endDate"
          :start-date="t.startDate"
          :categorias="t.categorias"
          :prioridade="t.prioridade"
        />
      </div>

      <AppButton class="add-task-button" @click="emit('add-task', c.id)"
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

@media (max-width: 760px) {
  .columns-list {
    grid-template-columns: repeat(var(--column-count), minmax(16rem, 1fr));
  }
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
