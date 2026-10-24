<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DocumentsBoard from '@/components/documents/DocumentsBoard.vue'

const route = useRoute()
const eventoId = computed(() => String(route.params.id ?? ''))
</script>

<template>
  <DocumentsBoard v-if="eventoId" :key="eventoId" :projeto-id="eventoId" />
  <p v-else role="status">Selecione um evento para acessar os documentos.</p>
</template>
