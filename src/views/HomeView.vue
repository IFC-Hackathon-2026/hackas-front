<script setup>
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import AppButton from '@/components/forms/AppButton.vue'
import KanbanBoard from '@/components/kanban/KanbanBoard.vue'

const userStore = useUserStore()
const router = useRouter()

function logout() {
  userStore.logout()
  return router.replace({ name: 'login' })
}
</script>

<template>
  <h1>Hackathon 2026 - Home Page</h1>
  <p>Logado: {{ userStore.isAuthenticated }}</p>
  <AppButton @click="logout" variant="secondary">Logout</AppButton>
  <KanbanBoard />
</template>

<style scoped></style>
