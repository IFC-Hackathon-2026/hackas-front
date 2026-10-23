
<script setup>
import { computed, ref } from 'vue';
import KanbanColumn from './KanbanColumn.vue';

const tasks = ref([
  { id: 0, categoryId: 0, title: 'Pesquisar temas do debate', startDate: '23/10', endDate: '25/10' },
  { id: 1, categoryId: 0, title: 'Definir participantes', startDate: '23/10', endDate: '26/10' },
  { id: 2, categoryId: 1, title: 'Preparar mesas de cooperação', startDate: '22/10', endDate: '27/10' },
  { id: 3, categoryId: 2, title: 'Criar o projeto', startDate: '21/10', endDate: '22/10' },
]);

const categories = ref([
  { id: 0, title: 'A fazer', styleColor: '#E53D00' },
  { id: 1, title: 'Em andamento', styleColor: '#FFBE33' },
  { id: 2, title: 'Concluído', styleColor: '#429E5E' },
]);

const kabanCategories = computed(() =>
  categories.value.map((category) => ({
    ...category,
    countTask: tasks.value.filter((task) => task.categoryId === category.id).length,
  })),
);
</script>

<template>
  <section class="kanban-board">
    <div class="section-header">
      <h2>Kaban</h2>
      <p>Organize tarefas, defina prioridades e acompanhe o progresso do projeto.</p>
    </div>
    <KanbanColumn :kaban-categories="kabanCategories" :tasks="tasks" />
  </section>
</template>

<style scoped>
.kanban-board {
  width: 100%;
}
</style>
