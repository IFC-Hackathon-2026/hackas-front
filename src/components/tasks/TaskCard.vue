<script setup>
import { prioridades } from '@/constants/prioridades';

const props = defineProps({
  title: String,
  startDate: String,
  endDate: String,
  categorias: Array,
  prioridade: String,
  atrasada: Boolean,
  concluidoEm: String,
});

function formatarData(data) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(data)) return data.split('-').reverse().join('/');
  return new Date(data).toLocaleDateString('pt-BR');
}

</script>

<template>
  <div class="list-container">
    <div class="task-card" :class="{ 'task-card-atrasada': props.atrasada && !props.concluidoEm }">
      <span
        class="mdi mdi-drag-vertical task-drag-handle"
        title="Arraste para mover a tarefa"
        aria-hidden="true"
        @click.stop
      />
      <div class="container">
        <div class="date-area">
          <span class="mdi mdi-calendar-outline" />{{ props.startDate }}
          -
          <span class="mdi mdi-calendar-outline" />{{ props.endDate }}
        </div>
        <h4 class="task-title">
          {{ props.title }}
          <span
            v-if="props.atrasada && !props.concluidoEm"
            class="mdi mdi-alert-circle task-alert"
            role="img"
            aria-label="Tarefa atrasada"
            title="Tarefa atrasada"
          />
        </h4>
        <p v-if="props.concluidoEm" class="task-completed">
          Concluído em: {{ formatarData(props.concluidoEm) }}
        </p>
        <ul class="task-infos">
          <li v-for="categoria in props.categorias" :key="categoria.id" class="task-tag">
            <span class="color-dot" :style="{ backgroundColor: categoria.cor }" />
            {{ categoria.nome }}
          </li>
          <li v-if="prioridades[props.prioridade]" class="task-tag">
            <span class="color-dot" :style="{ backgroundColor: prioridades[props.prioridade].cor }" />
            {{ prioridades[props.prioridade].nome }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  min-width: 0;
}

.task-drag-handle {
  font-size: 1.3rem;
  color: #9a9a9a;
  cursor: grab;
  touch-action: none;
}

.task-drag-handle:active {
  cursor: grabbing;
}

.task-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
}

.task-alert {
  flex-shrink: 0;
  color: #b91c1c;
}

.task-completed {
  margin-top: 0.25rem;
  color: #777;
  font-size: 0.8rem;
}

.task-infos {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0;
  list-style: none;
}

.task-tag {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid #d9d9d9;
  border-radius: 12px;
  font-size: 0.75rem;
  overflow-wrap: anywhere;
}

.color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.list-container {
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
}

.date-area {
  font-size: 0.8rem;
  color: #9a9a9a;
}

.task-card {
  max-width: 100%;
  min-height: 6rem;
  padding: 1rem;
  border: 1px solid #9a9a9a;
  border-radius: 10px;
  display: flex;
  gap: 0.5rem;
  cursor: pointer;
  transition: all .3s ease;
}

.task-card-atrasada {
  border-color: #b91c1c;
}

.task-card:hover {
  box-shadow: 0 4px 16px rgb(0 18 40 / 15%);
  transform: translateY(-4px);
}

@media (max-width: 600px) {
  .task-card { min-height: 5rem; padding: 0.75rem; }
  .task-card:hover { transform: none; }
  .task-drag-handle { display: grid; place-items: center; min-width: 32px; }
  .task-tag { font-size: 0.6875rem; }
}
</style>
