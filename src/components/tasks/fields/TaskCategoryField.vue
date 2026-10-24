<script setup>
import { computed, ref, watch } from 'vue'
import { useCategoriaStore } from '@/stores/categoriaStore'
import { apiErrorMessage as formatarErroApi } from '@/utils/apiErrorMessage'
import { notificacao } from '@/services/notificacaoService'
import TaskColorPicker from './TaskColorPicker.vue'
import AppButton from '@/components/forms/AppButton.vue';

const categoriaStore = useCategoriaStore()

const props = defineProps({
  projetoId: {
    type: [String, Number],
    required: true
  }
})

const categorias = defineModel({ type: Array, required: true })

const carregandoCategoria = defineModel('carregando', { type: Boolean, default: false })
const categoriaPendente = defineModel('pendente', { type: Boolean, default: false })

const mostrarOutraCategoria = ref(false)
const nomeCategoria = ref('')
const corCategoria = ref('#2767AA')
const erroCategoria = ref('')

watch(
  computed(() => Boolean(mostrarOutraCategoria.value && nomeCategoria.value.trim())),
  (valor) => {
    categoriaPendente.value = valor
  },
  { immediate: true },
)

async function adicionarCategoria() {
  if (carregandoCategoria.value || !nomeCategoria.value.trim()) return
  carregandoCategoria.value = true
  erroCategoria.value = ''

  const categoriasSelecionadas = categorias.value
  const projetoId = props.projetoId

  try {
    const categoria = await categoriaStore.createCategoria(projetoId, {
      nome: nomeCategoria.value.trim(),
      cor: corCategoria.value,
    })
    categoriasSelecionadas.push(categoria.id)
    nomeCategoria.value = ''
    mostrarOutraCategoria.value = false
    notificacao.sucesso('Categoria criada com sucesso.')
  } catch (erro) {
    erroCategoria.value = formatarErroApi(erro, 'Não foi possível criar a categoria.')
    notificacao.erro(erroCategoria.value)
  } finally {
    carregandoCategoria.value = false
  }
}
</script>

<template>
  <fieldset class="field">
    <legend>Categorias</legend>

    <div class="choices">
      <label
        v-for="categoria in categoriaStore.categoriasOrdenadas"
        :key="categoria.id"
        class="choice"
      >
        <input type="checkbox" v-model="categorias" :value="categoria.id" />
        <span class="color-dot" :style="{ backgroundColor: categoria.cor }"></span
        >{{ categoria.nome }}
      </label>
      <button
        type="button"
        class="choice"
        @click="mostrarOutraCategoria = !mostrarOutraCategoria"
      >
        + Outra categoria
      </button>
    </div>

    <div v-if="mostrarOutraCategoria" class="new-category">
      <label class="field"
        >Nome da categoria<input
          v-model="nomeCategoria"
          maxlength="50"
          placeholder="Nome da categoria"
      /></label>
      <TaskColorPicker v-model="corCategoria" />
      <AppButton variant="secondary" @click="adicionarCategoria" :disabled="!nomeCategoria.trim()">Adicionar categoria</AppButton>
      </div>


    <p v-if="erroCategoria" class="error" role="alert">{{ erroCategoria }}</p>

  </fieldset>
</template>

<style scoped>
.new-category {
  display: grid;
  gap: 0.75rem;
  padding-block: 1rem;
}
.new-category input {
  width: 100%;
  padding: 0.65rem;
  border: 1px solid #9a9a9a;
  border-radius: 6px;
  background: transparent;
  color: inherit;
}
.error {
  color: #b91c1c;
}
</style>
<style scoped src="./choices.css"></style>
