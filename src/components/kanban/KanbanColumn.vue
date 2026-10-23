<script setup>
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

  <TaskCard
    v-for="t in props.tasks"
    :key="t.id"
    :title="t.title"
    :end-date="t.endDate"
    :start-date="t.startDate"
  />

    </li>
  </ul>
</template>

<style scoped>
.columns-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1em;
}

.kanban-column{
  border: 2px solid;
  border-radius: 10px;
  padding: 1rem;
}

.column-header {
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


