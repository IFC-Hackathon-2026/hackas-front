<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import KanbanBoard from '@/components/kanban/KanbanBoard.vue'

const route = useRoute()
const eventoId = computed(() => String(route.params.id ?? ''))
</script>

<template>
  <KanbanBoard v-if="eventoId" :key="eventoId" :projeto-id="eventoId" />
  <p v-else role="status">Selecione um evento para acessar o Kanban.</p>
</template>
