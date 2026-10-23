<script setup>
const tasks = [
  { id: 0, title: 'Pesquisar temas do debate', startDate: '03/10', endDate: '05/10' },
  { id: 1, title: 'Mesas de cooperação teste', startDate: '03/10', endDate: '05/10' },
  { id: 2, title: 'Titulo da task', startDate: '03/10', endDate: '05/10' },
]
</script>

<template>
  <div class="list-container">
    <div v-for="t in tasks" :key="t.id" class="task-card">
      <span class="mdi mdi-drag-vertical" style="font-size: 1.3rem;" />
      <div class="container">
        <div class="date-area">
          <span class="mdi mdi-calendar-outline" />{{ t.startDate }}
          -
          <span class="mdi mdi-calendar-outline" />{{ t.endDate }}
        </div>
        <h4>{{ t.title }}</h4>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

.date-area {
  font-size: 0.8rem;
  color: #9a9a9a;
}

.task-card {
  width: 20rem;
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
