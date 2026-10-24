
<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const digitos = ref(['', '', '', '', '', ''])
const inputsCodigo = ref([])

const codigo2fa = computed(() => digitos.value.join(''))

function aoDigitar(event, index) {
  const valor = event.target.value.replace(/\D/g, '').slice(-1)

  digitos.value[index] = valor
  event.target.value = valor

  if (valor && index < 5) {
    nextTick(() => {
      inputsCodigo.value[index + 1]?.focus()
    })
  }
}

function aoPressionarTecla(event, index) {
  if (
    event.key === 'Backspace' &&
    !digitos.value[index] &&
    index > 0
  ) {
    inputsCodigo.value[index - 1]?.focus()
  }
}

function aoColar(event) {
  event.preventDefault()

  const texto = event.clipboardData
    .getData('text')
    .replace(/\D/g, '')
    .slice(0, 6)

  texto.split('').forEach((numero, index) => {
    digitos.value[index] = numero
  })

  nextTick(() => {
    inputsCodigo.value[Math.min(texto.length, 5)]?.focus()
  })
}

async function enviarCodigo() {
  console.log('Código digitado:', codigo2fa.value)

  // Navegação de teste.
  // A verificação real deverá ser feita pelo backend.
  await router.push({ name: 'home' })
}
</script>

<template>
  <div class="verification-page">
    <img
      src="/FarolFlow-logo-light.svg"
      alt="Logo FarolFlow"
    />

    <section>
      <h1>VERIFIQUE SEU E-MAIL</h1>
      <p>
        Enviamos um código de verificação para o seu e-mail.
        <br />
        Digite o código abaixo para continuar.
      </p>
    </section>

    <div class="codigo-container">
      <input
        v-for="(digito, index) in digitos"
        :key="index"
        :ref="el => inputsCodigo[index] = el"
        :value="digito"
        type="text"
        inputmode="numeric"
        maxlength="1"
        autocomplete="one-time-code"
        class="codigo-input"
        :aria-label="`Dígito ${index + 1} do código`"
        @input="aoDigitar($event, index)"
        @keydown="aoPressionarTecla($event, index)"
        @paste="aoColar"
      />
    </div>

    <p class="aviso">
      O código pode levar alguns minutos para chegar.
    </p>

    <button type="button" @click="enviarCodigo">
      Enviar
    </button>
  </div>
</template>

<style scoped>
.verification-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  box-sizing: border-box;
  padding: 30px 16px;
}

img {
  width: 200px;
  height: auto;
  margin-bottom: 20px;
}

section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #141414;
  text-align: center;
}

p {
  font-size: 1rem;
  text-align: center;
  color: #01295F;
}

.codigo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 50px;
  margin: 50px 0;
}

.codigo-input {
  width: 75px;
  height: 75px;
  border: 1px solid #a3b5d1;
  border-radius: 4px;
  background: white;
  text-align: center;
  font-size: 22px;
  font-weight: 600;
  color: #082b61;
  outline: none;
  box-sizing: border-box;
}

.codigo-input:focus {
  border: 2px solid #082b61;
}

p.aviso {
  font-size: 1rem;
  text-align: center;
  color: #01295F;
  margin-bottom: 50px;
}

button {
  width: 100%;
  max-width: 280px;
  height: 48px;
  background-color: #082b61;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

button:hover {
  background-color: #01295F;
}

@media (max-width: 480px) {
  .codigo-container {
    gap: 8px;
  }

  .codigo-input {
    width: 38px;
    height: 42px;
  }

  h1 {
    font-size: 1.5rem;
  }
}
</style>
