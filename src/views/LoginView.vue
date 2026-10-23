<script setup>
import { ref } from 'vue';
import loginComponent from '@/components/login/loginComponet.vue';
import registerComponent from '@/components/login/registerComponent.vue';

const mostrarLogin = ref(true);
</script>

<template>
  <loginComponent v-if="mostrarLogin" @ir-para-cadastro="mostrarLogin = false" />
  <registerComponent v-else @ir-para-login="mostrarLogin = true" />
</template>