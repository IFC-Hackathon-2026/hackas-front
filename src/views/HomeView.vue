<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import AppButton from '@/components/forms/AppButton.vue'
import KanbanBoard from '@/components/kanban/KanbanBoard.vue'
import AppModal from '@/components/modais/AppModal.vue'

const userStore = useUserStore()
const router = useRouter()
const showModal = ref(false)

function logout() {
  userStore.logout()
  return router.replace({ name: 'login' })
}
</script>

<template>
  <h1>Hackathon 2026 - Home Page</h1>
  <p>Logado: {{ userStore.isAuthenticated }}</p>
  <AppButton @click="logout" variant="secondary">Logout</AppButton>
  <AppButton @click="showModal = true">Abrir modal de exemplo</AppButton>

  <AppModal v-model:visible="showModal" title="Modal de exemplo">
    <p>Aqui você pode colocar um formulário ou qualquer outro conteúdo.</p>

    <template>
      <AppButton @click="showModal = false">Fechar</AppButton>
    </template>
  </AppModal>

  <KanbanBoard />
</template>

<style scoped></style>
