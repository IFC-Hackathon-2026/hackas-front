<script setup>
import { prioridades } from '@/constants/prioridades';

const props = defineProps({
  title: String,
  startDate: String,
  endDate: String,
  categorias: Array,
  prioridade: String,
});

</script>

<template>
  <div class="list-container">
    <div class="task-card">
      <span class="mdi mdi-drag-vertical" style="font-size: 1.3rem; color: #9a9a9a;" />
      <div class="container">
        <div class="date-area">
          <span class="mdi mdi-calendar-outline" />{{ props.startDate }}
          -
          <span class="mdi mdi-calendar-outline" />{{ props.endDate }}
        </div>
        <h4 style="font-weight: 600;">{{ props.title }}</h4>
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

.task-card:hover {
  box-shadow: 0 4px 16px rgb(0 18 40 / 15%);
  transform: translateY(-4px);
}
</style>
