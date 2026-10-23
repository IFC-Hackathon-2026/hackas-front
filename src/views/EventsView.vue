
<script setup>
import { ref } from 'vue';

import initialEventsComponent from '@/components/events/initialEventsComponent.vue';
import listEventsComponent from '@/components/events/listEventsComponent.vue';


const busca = ref('');


const categoriasSelecionadas = ref([]);
</script>

<template>
  
  <initialEventsComponent
    @buscar-eventos="busca = $event"
    @filtrar-categorias="categoriasSelecionadas = $event"
  />

  <listEventsComponent
    :busca="busca"
    :categorias-selecionadas="categoriasSelecionadas"
  />
</template>
