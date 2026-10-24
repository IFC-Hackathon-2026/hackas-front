<script setup>
import initialEventsComponent from '@/components/events/initialEventsComponent.vue';
import KanbanBoard from '@/components/kanban/KanbanBoard.vue'
import DocumentsBoard from '@/components/documents/DocumentsBoard.vue'
import { useProjetoStore } from '@/stores/projetoStore'

const projetoStore = useProjetoStore()

</script>

<template>
    <initialEventsComponent/>
  <KanbanBoard />
  <DocumentsBoard :projeto-id="projetoStore.projetoAtual?.id" />
</template>
