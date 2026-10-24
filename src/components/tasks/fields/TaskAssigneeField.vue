<script setup>
defineProps({ users: { type: Array, required: true }, loading: Boolean })
const model = defineModel({ type: Array, required: true })
</script>

<template>
  <fieldset class="field">
    <legend>Responsáveis</legend>
    <div class="user-list">
      <label v-for="user in users" :key="user.id" class="choice">
        <input type="checkbox" v-model="model" :value="user.id" />
        <img v-if="user?.foto?.url" :src="user.foto.url" :alt="user.name || user.email" class="user-avatar">
        <span v-else class="mdi mdi-account-circle user-avatar-default" aria-hidden="true"></span>
        {{ user.name || user.email }}
      </label>
    </div>
    <p v-if="!loading && !users.length">Nenhum responsável disponível neste projeto.</p>
  </fieldset>
</template>

<style scoped>
.user-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  max-height: 10rem;
  overflow-y: auto;
}

.user-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
}

.user-avatar-default {
  width: 35px;
  height: 35px;
  font-size: 35px;
  line-height: 1;
  color: #9a9a9a;
}
</style>
<style scoped src="./choices.css"></style>
