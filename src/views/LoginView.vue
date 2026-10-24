
<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import loginComponent from '@/components/login/loginComponet.vue';
import registerComponent from '@/components/login/registerComponent.vue';

const mostrarLogin = ref(true);

const route = useRoute();
const router = useRouter();

function redirecionarAposAutenticacao() {
  const redirect = route.query.redirect;

  const destino =
    typeof redirect === 'string' &&
    redirect.startsWith('/') &&
    !redirect.startsWith('//') &&
    !redirect.startsWith('/\\')
      ? redirect
      : '/eventos';

  router.replace(destino);
}
</script>

<template>
  <loginComponent
    v-if="mostrarLogin"
    @ir-para-cadastro="mostrarLogin = false"
    @login-sucesso="redirecionarAposAutenticacao"
  />

  <registerComponent
    v-else
    @ir-para-login="mostrarLogin = true"
    @cadastro-sucesso="redirecionarAposAutenticacao"
  />
</template>
