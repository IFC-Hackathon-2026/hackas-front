<script setup>
const props = defineProps({
  title: String,
  startDate: String,
  endDate: String,
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
      </div>
    </div>
  </div>
</template>

<style scoped>
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
