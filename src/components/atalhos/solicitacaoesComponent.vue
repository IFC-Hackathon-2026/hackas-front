<script setup>
import { computed, onScopeDispose, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePedidoParticipacaoStore } from '@/stores/pedidoParticipacaoStore'
import { useProjetoStore } from '@/stores/projetoStore'
import { useUserStore } from '@/stores/userStore'
import api from '@/api/config'

const route = useRoute()
const pedidoStore = usePedidoParticipacaoStore()
const projetoStore = useProjetoStore()
const userStore = useUserStore()
const equipeId = computed(() => String(route.params.id ?? route.query.id ?? ''))
const aba = ref('pendentes')
const pedidos = ref([])
const carregando = ref(false)
const respondendo = ref(false)
const erro = ref('')
const mensagem = ref('')
const fotosComErro = ref(new Set())
const membrosAtuais = ref(new Set())
let consulta = 0
function jaParticipa(pedido) {
  const id = pedido.usuario_detalhe?.id ?? pedido.usuario
  return id != null && membrosAtuais.value.has(String(id))
}
const visiveis = computed(() => pedidos.value.filter((pedido) => {
  if (aba.value === 'pendentes') return pedido.status === 'pendente' && !jaParticipa(pedido)
  return ['aceito', 'recusado'].includes(pedido.status)
}))
const statusNomes = { pendente: 'Pendente', aceito: 'Aceito', recusado: 'Recusado' }

function fotoUrl(pedido) {
  const url = pedido.usuario_detalhe?.foto?.url
  return url ? new URL(url, new URL(api.defaults.baseURL, window.location.origin)).href : ''
}

function podeResponder(pedido) {
  if (pedido.status !== 'pendente' || jaParticipa(pedido)) return false
  // Convites são respondidos pelo convidado; solicitações, pelos administradores da equipe.
  if (pedido.tipo === 'convite') {
    return userStore.user?.id != null && String(pedido.usuario_detalhe?.id) === String(userStore.user.id)
  }
  return pedido.tipo === 'solicitacao' &&
    String(projetoStore.projetoAtual?.id) === equipeId.value && projetoStore.podeConfigurar
}

async function carregar() {
  const atual = ++consulta
  pedidos.value = []
  membrosAtuais.value = new Set()
  fotosComErro.value = new Set()
  erro.value = ''
  carregando.value = Boolean(equipeId.value)
  if (!equipeId.value) return
  const projetoId = equipeId.value
  try {
    const projeto = await projetoStore.getProjeto(projetoId)
    if (atual !== consulta) return
    const ids = (projeto.participacoes ?? []).map(({ usuario }) =>
      typeof usuario === 'object' ? usuario?.id : usuario,
    )
    const criadorId = typeof projeto.criador === 'object' ? projeto.criador?.id : projeto.criador
    membrosAtuais.value = new Set([...ids, criadorId].filter((id) => id != null).map(String))
    let params = { projeto: projetoId, page_size: 100 }
    const lista = []
    do {
      const pagina = await pedidoStore.getPedidos(params)
      if (atual !== consulta) return
      lista.push(...pagina)
      params = pedidoStore.next
        ? { ...Object.fromEntries(new URL(pedidoStore.next, window.location.origin).searchParams), projeto: projetoId }
        : null
    } while (params)
    pedidos.value = lista
  } catch (error) {
    if (atual === consulta) erro.value = error.response?.data?.detail || 'Não foi possível carregar as solicitações e os convites.'
  } finally {
    if (atual === consulta) carregando.value = false
  }
}

async function responder(pedido, aceitar) {
  if (respondendo.value || !podeResponder(pedido)) return
  const projetoId = equipeId.value
  respondendo.value = true
  erro.value = ''
  mensagem.value = ''
  try {
    if (aceitar) await pedidoStore.aceitarPedido(pedido.id)
    else await pedidoStore.recusarPedido(pedido.id)
    if (projetoId !== equipeId.value) return
    await carregar()
    mensagem.value = aceitar ? 'Pedido aceito.' : 'Pedido recusado.'
  } catch (error) {
    if (projetoId === equipeId.value) erro.value = error.response?.data?.detail || 'Não foi possível responder ao pedido.'
  } finally {
    respondendo.value = false
  }
}

watch(equipeId, () => {
  aba.value = 'pendentes'
  mensagem.value = ''
  carregar()
}, { immediate: true })
onScopeDispose(() => { consulta++ })
</script>

<template>
  <section class="requests" aria-label="Solicitações e convites">
    <div class="request-tabs" role="group" aria-label="Filtrar pedidos">
      <button type="button" :class="{ active: aba === 'pendentes' }" :aria-pressed="aba === 'pendentes'" @click="aba = 'pendentes'">Pendentes</button>
      <button type="button" :class="{ active: aba === 'respondidas' }" :aria-pressed="aba === 'respondidas'" @click="aba = 'respondidas'">Respondidas</button>
    </div>
    <p v-if="!equipeId">Selecione uma equipe para ver os pedidos.</p>
    <p v-else-if="carregando" role="status">Carregando pedidos...</p>
    <template v-else>
      <ul v-if="visiveis.length" class="request-list">
        <li v-for="pedido in visiveis" :key="pedido.id" class="request-row">
          <img v-if="fotoUrl(pedido) && !fotosComErro.has(pedido.id)" :src="fotoUrl(pedido)" class="avatar" alt="" @error="fotosComErro.add(pedido.id)" />
          <span v-else class="avatar placeholder" aria-hidden="true"></span>
          <div class="request-info">
            <h2>{{ pedido.usuario_detalhe?.name || pedido.usuario_detalhe?.email || 'Usuário' }}</h2>
            <p>{{ pedido.usuario_detalhe?.email }}</p>
            <span class="request-type">{{ pedido.tipo === 'convite' ? 'Convite enviado' : 'Solicitação de entrada' }}</span>
          </div>
          <div v-if="podeResponder(pedido)" class="request-actions">
            <button type="button" class="reject" :disabled="respondendo" @click="responder(pedido, false)"><span class="mdi mdi-close" aria-hidden="true"></span>Recusar</button>
            <button type="button" class="accept" :disabled="respondendo" @click="responder(pedido, true)">Aceitar</button>
          </div>
          <span v-else :class="['request-status', pedido.status]">{{ pedido.status === 'pendente' && pedido.tipo === 'convite' ? 'Aguardando convidado' : statusNomes[pedido.status] || pedido.status }}</span>
        </li>
      </ul>
      <p v-else-if="!erro" class="empty">{{ aba === 'pendentes' ? 'Nenhuma solicitação ou convite pendente.' : 'Nenhuma solicitação ou convite respondido.' }}</p>
    </template>
    <p v-if="mensagem" class="success" role="status">{{ mensagem }}</p>
    <div v-if="erro" class="error" role="alert"><p>{{ erro }}</p><button type="button" :disabled="carregando || respondendo" @click="carregar">Tentar novamente</button></div>
  </section>
</template>

<style scoped>
.requests { color: var(--primaria); }
.request-tabs { display: flex; gap: 8px; margin-bottom: 40px; }
.request-tabs button { padding: 0 20px 12px; border: 0; border-bottom: 2px solid transparent; background: transparent; color: var(--primaria); font-size: 20px; font-weight: 600; }
.request-tabs .active { border-bottom-color: var(--primaria); }
.request-list { display: flex; flex-direction: column; gap: 44px; }
.request-row { display: flex; align-items: center; gap: 24px; min-width: 0; }
.avatar { width: 88px; height: 88px; flex-shrink: 0; border-radius: 50%; object-fit: cover; }
.placeholder { background: #d9d9d9; }
.request-info { flex: 1; min-width: 0; }
h2 { color: #171717; font-size: 16px; font-weight: 600; }
.request-info p { font-size: 13px; color: #4f5560; overflow-wrap: anywhere; }
.request-type { font-size: 12px; }
.request-actions { display: flex; gap: 16px; flex-shrink: 0; }
button { cursor: pointer; }
.request-actions button { display: inline-flex; align-items: center; justify-content: center; gap: 4px; min-width: 112px; padding: 4px 14px; border: 1px solid var(--primaria); border-radius: 5px; font-size: 15px; font-weight: 500; line-height: 1.4; }
.reject { background: white; color: var(--primaria); }
.accept { background: var(--primaria); color: white; }
.request-status { font-size: 13px; text-align: right; }
.aceito, .success { color: #176b35; }
.recusado, .error { color: #a12424; }
.success, .error, .empty { margin-top: 24px; }
.error button { margin-top: 12px; }
button:disabled { opacity: .5; cursor: default; }
button:focus-visible { outline: 2px solid #2767aa; outline-offset: 3px; }
@media (max-width: 1100px) {
  .request-row { flex-wrap: wrap; gap: 16px; }
  .request-info { flex-basis: calc(100% - 110px); }
  .request-actions, .request-status { margin-left: 104px; }
}
@media (max-width: 480px) {
  .request-tabs button { font-size: 16px; padding-inline: 12px; }
  .avatar { width: 64px; height: 64px; }
  .request-info { flex-basis: calc(100% - 80px); }
  .request-actions, .request-status { margin-left: 0; }
  .request-actions { width: 100%; gap: 12px; }
  .request-actions button { flex: 1; min-width: 0; }
}
</style>
