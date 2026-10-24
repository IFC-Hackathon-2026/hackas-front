<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProjetoStore } from '@/stores/projetoStore'

const route = useRoute()
const projetoStore = useProjetoStore()
const equipeId = computed(() => String(route.params.id ?? route.query.id ?? ''))
const podeVerConfiguracoes = computed(() => equipeId.value &&
  String(projetoStore.projetoAtual?.id) === equipeId.value && projetoStore.podeConfigurar)
</script>

<template>
  <nav class="event-navigation" aria-label="Navegação da equipe">
    <ul>
      <li><span class="mdi mdi-view-grid-outline" aria-hidden="true"></span> Kanban</li>
      <li><span class="mdi mdi-file-document-multiple-outline" aria-hidden="true"></span> Documentos</li>
      <li>
        <RouterLink v-if="equipeId" :to="{ name: 'dashboard', params: { id: equipeId } }" :class="{ active: route.name === 'detailsEventsView' }" active-class="active">
          <span class="mdi mdi-information-outline" aria-hidden="true"></span> Dashboard
        </RouterLink>
        <span v-else>Dashboard</span>
      </li>

      
      <li v-if="podeVerConfiguracoes">
        <RouterLink :to="{ name: 'config', params: { id: equipeId } }" active-class="active">
          <span class="mdi mdi-cog" aria-hidden="true"></span> Configurações
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.event-navigation { 
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 100%;
  min-height: 94px;
  margin: 40px auto 0;
  padding: 20px 28px;
  border-radius: 14px;
  background: #f6f6f2;
}
ul { 
  display: flex; 
  justify-content: 
  center; flex-wrap: 
  wrap; gap: 20px 48px;
 }
li, a { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
}
li { 
  color: #808080; 
  font-weight: 600; 
}
a {
   color: inherit; text-decoration: none; }
a.active { 
  color: var(--primaria); 
  text-decoration: none;
  text-underline-offset: 5px; 
}
.mdi { 
  font-size: 24px; 
}
@media (max-width: 600px) { 
  .event-navigation {
    justify-content: flex-start;
    min-height: 0;
    margin-top: 20px;
    padding: 8px;
    overflow-x: auto;
    scrollbar-width: thin;
  }
  ul { flex-wrap: nowrap; justify-content: flex-start; gap: 4px; min-width: max-content; }
  li, a { gap: 5px; min-height: 40px; padding-inline: 6px; }
  li { font-size: 0.75rem; white-space: nowrap; }
  .mdi { font-size: 20px; } 
  }
</style>
