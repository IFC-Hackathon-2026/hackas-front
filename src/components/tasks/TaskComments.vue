<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { useComentarioStore } from '@/stores/comentarioStore'
import { apiErrorMessage } from '@/utils/apiErrorMessage'
import { notificacao } from '@/services/notificacaoService'
import AppButton from '../forms/AppButton.vue'

const props = defineProps({
  tarefaId: { type: [Number, String], required: true },
  desabilitado: Boolean,
})
const comentarioStore = useComentarioStore()
const conteudo = ref('')
const carregando = ref(false)
const enviando = ref(false)
const erroCarregamento = ref('')
const erroEnvio = ref('')
let versao = 0

const comentarios = computed(() =>
  String(comentarioStore.tarefaAtualId) === String(props.tarefaId)
    ? comentarioStore.comentarios : [],
)

async function carregarComentarios() {
  const atual = ++versao
  carregando.value = true
  erroCarregamento.value = ''
  try {
    await comentarioStore.getComentarios(props.tarefaId, { page_size: 100 }, true)
  } catch (error) {
    if (atual === versao) {
      erroCarregamento.value = apiErrorMessage(error, 'Não foi possível carregar os comentários.')
      notificacao.erro(erroCarregamento.value)
    }
  } finally {
    if (atual === versao) carregando.value = false
  }
}

async function enviarComentario() {
  if (enviando.value || carregando.value || erroCarregamento.value || props.desabilitado) return
  if (!conteudo.value.trim()) return
  const atual = versao
  enviando.value = true
  erroEnvio.value = ''
  try {
    await comentarioStore.createComentario(props.tarefaId, { conteudo: conteudo.value.trim() })
    if (atual === versao) {
      conteudo.value = ''
      notificacao.sucesso('Comentário enviado com sucesso.')
    }
  } catch (error) {
    if (atual === versao) {
      erroEnvio.value = apiErrorMessage(error, 'Não foi possível enviar o comentário. Tente novamente.')
      notificacao.erro(erroEnvio.value)
    }
  } finally {
    if (atual === versao) enviando.value = false
  }
}

watch(() => props.tarefaId, () => {
  conteudo.value = ''
  erroEnvio.value = ''
  enviando.value = false
  carregarComentarios()
}, { immediate: true })
onUnmounted(() => versao++)
</script>

<template>
  <section class="task-comments" aria-label="Comentários da tarefa">
    <h3>Comentários</h3>
    <p v-if="carregando" class="notice" role="status">Carregando comentários…</p>
    <div v-else-if="erroCarregamento" class="error" role="alert">
      <p>{{ erroCarregamento }}</p>
      <AppButton variant="secondary" :disabled="props.desabilitado" @click="carregarComentarios">
        Tentar novamente
      </AppButton>
    </div>
    <ul v-else-if="comentarios.length" class="comments-list" aria-label="Comentários publicados">
      <li v-for="comentario in comentarios" :key="comentario.id" class="comment">
        <strong>{{ comentario.autor?.name || comentario.autor?.email || 'Usuário' }}</strong>
        <p>{{ comentario.conteudo }}</p>
      </li>
    </ul>
    <p v-else class="notice">Nenhum comentário nesta tarefa.</p>

    <form class="comment-form" @submit.prevent.stop="enviarComentario">
      <fieldset :disabled="enviando || carregando || Boolean(erroCarregamento) || props.desabilitado">
        <label class="field">
          Adicionar comentário
          <textarea v-model="conteudo" rows="3" maxlength="5000" placeholder="Escreva seu comentário…" required />
        </label>
        <p v-if="erroEnvio" class="error" role="alert">{{ erroEnvio }}</p>
        <p v-if="enviando" class="notice" role="status">Enviando comentário…</p>
        <AppButton type="submit" :disabled="!conteudo.trim() || enviando">
          {{ enviando ? 'Enviando…' : 'Enviar comentário' }}
        </AppButton>
      </fieldset>
    </form>
  </section>
</template>

<style scoped>
.task-comments {
  margin-top: 1.5rem;
  border-top: 1px solid #d9d9d9;
  padding-top: 1rem;
}
h3 {
  margin-bottom: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 18rem;
  overflow-y: auto;
  padding: 0;
  list-style: none;
}
.comment {
  padding: 1rem;
  border: 1px solid #d9d9d9;
  border-radius: 10px;
  background: #fff;
  font-size: 0.85rem;
  overflow-wrap: anywhere;
}
.comment strong {
  color: var(--primaria);
}
.comment p {
  margin-top: 0.4rem;
  white-space: pre-wrap;
}
.comment-form {
  margin-top: 1rem;
}
fieldset, .field {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
fieldset {
  min-width: 0;
  padding: 0;
  border: 0;
}
textarea {
  width: 100%;
  padding: 0.65rem;
  border: 1px solid #9a9a9a;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  resize: vertical;
}
textarea:focus-visible {
  outline: 2px solid var(--primaria);
  outline-offset: 2px;
}
.notice {
  color: #777;
  font-size: 0.85rem;
}
.error {
  color: #b91c1c;
  font-size: 0.85rem;
}
.error > p {
  margin-bottom: 0.5rem;
}
</style>
