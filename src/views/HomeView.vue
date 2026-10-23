<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import AppButton from '@/components/forms/AppButton.vue';

const authStore = useAuthStore();
const router = useRouter();

function logout() {
  authStore.logout();
  return router.replace({ name: 'login' });
}
</script>

<template>
  <h1>Hackathon 2026 - Home Page</h1>
  <p>Logado: {{ authStore.isAuthenticated }}</p>
  <AppButton @click="logout" variant="secondary">Logout</AppButton>

</template>

<style scoped>
</style>
