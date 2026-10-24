<script setup>
import { RouterView, useRoute } from 'vue-router'
import KanbanComponent from '@/components/atalhos/kanbanComponent.vue'
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
    <component :is="Component || KanbanComponent" />
  </RouterView>
  </section>
  </div>
</template>

<style scoped>
.event-details { width: 100%; max-width: 1600px; margin: 48px auto 160px; }
#event-tasks-title { color: var(--primaria); font-size: 26px; font-weight: 600; }
@media (max-width: 760px) {
  .event-details { margin: 28px auto 64px; }
  #event-tasks-title { font-size: 22px; }
}
</style>
