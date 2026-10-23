<script setup>
import AppButton from '../forms/AppButton.vue';
import TaskCard from '../tasks/TaskCard.vue';

const props = defineProps({
  kabanCategories: {
    type: Array,
    required: true,
  },

  tasks: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <ul class="columns-list">
    <li
      v-for="c in props.kabanCategories"
      :key="c.id"
      class="kanban-column"
      :style="{borderColor: c.styleColor}"
    >
    <div class="column-header">
      <div class="column-title" :style="{ color: c.styleColor}">
        <h3 style="font-weight: 500">{{ c.title }}</h3>
        <span class="task-count">{{ c.countTask }}</span>
      </div>

      <div class="column-configs">
        <span class="mdi mdi-dots-vertical" title="Configurações"/>
        <span class="mdi mdi-plus" title="Adicionar Tarefa"/>
      </div>
    </div>

    <div class="column-tasks">
    <TaskCard
    v-for="t in props.tasks.filter((task) => task.categoryId === c.id)"
    :key="t.id"
    :title="t.title"
    :end-date="t.endDate"
    :start-date="t.startDate"
    />
    </div>

    <AppButton class="add-task-button">Adicionar Tarefa <span class="mdi mdi-plus"/></AppButton>

  </li>

  </ul>
</template>

<style scoped>
.add-task-button {
  margin-top: 1rem;
  width: 100%;
  flex-shrink: 0;
}

.column-tasks {
  height: 31rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
  scrollbar-gutter: stable;
}

.column-tasks :deep(.list-container) {
  margin-top: 0;
  flex-shrink: 0;
}

.column-tasks :deep(.task-card) {
  height: 7rem;
  min-height: 7rem;
}

.column-tasks :deep(.container) {
  min-width: 0;
}

.column-tasks :deep(h4) {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.columns-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1em;
}

.kanban-column{
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 2px solid;
  border-radius: 10px;
  padding: 1rem;
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
  transition: all .2s ease;
}

.column-configs span:hover{
  color: #636363;
  transition: all .2s ease;
}
</style>


