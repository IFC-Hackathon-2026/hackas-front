<script setup>
import AppButton from '../forms/AppButton.vue'
import TaskCard from '../tasks/TaskCard.vue'
const emit = defineEmits(['add-task', 'open-task'])

const props = defineProps({
  kabanCategories: {
    type: Array,
    required: true,
  },

  tasks: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <ul class="columns-list">
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
          <span class="mdi mdi-dots-vertical" title="Configurações" />
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1em;
}

.kanban-column {
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
    grid-template-columns: repeat(3, minmax(16rem, 1fr));
    overflow-x: auto;
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
  cursor: pointer;
  font-size: 1.2rem;
  color: #9a9a9a;
  transition: all 0.2s ease;
}

.column-configs span:hover {
  color: #636363;
  transition: all 0.2s ease;
}
</style>
