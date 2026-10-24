<script setup>
import { useRoute } from 'vue-router'
import DetailsEventsComponent from '@/components/events/detailsEventsComponent.vue'

const route = useRoute()
</script>

<template>
  <DetailsEventsComponent :evento-id="route.params.id" />
</template>
