<script setup>
import { RouterView, useRoute } from 'vue-router'
import DashboardComponent from '@/components/atalhos/dashboardComponent.vue'
import DetailsEventsComponent from '@/components/events/detailsEventsComponent.vue'
import atalhosEventoComponent from '@/components/layout/atalhosEventoComponent.vue'

const route = useRoute()
</script>

<template>
  <div class="event-details">
  <DetailsEventsComponent :evento-id="route.params.id" />
  <section aria-labelledby="event-tasks-title">
  <h2 id="event-tasks-title">TAREFAS</h2>
  <atalhosEventoComponent/>
  <RouterView v-slot="{ Component }">
    <component :is="Component || DashboardComponent" />
  </RouterView>
  </section>
  </div>
</template>

<style scoped>
.event-details { width: 100%; max-width: 1600px; margin: 48px auto 160px; }
#event-tasks-title { color: var(--primaria); font-size: 26px; font-weight: 600; }
@media (max-width: 760px) {
  .event-details { margin: 20px auto 40px; }
  #event-tasks-title { font-size: 1.25rem; }
}
</style>
