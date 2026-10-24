import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import PedidoParticipacaoService from '@/services/pedidoParticipacaoService'

const service = new PedidoParticipacaoService()

export const usePedidoParticipacaoStore = defineStore('pedidoParticipacao', () => {
  const pedidos = ref([])
  const total = ref(0)
  const next = ref(null)
  const previous = ref(null)
  const error = ref(null)
  const pending = ref(0)

  const loading = computed(() => pending.value > 0)
  const pendentes = computed(() => pedidos.value.filter((item) => item.status === 'pendente'))
  const convites = computed(() => pedidos.value.filter((item) => item.tipo === 'convite'))
  const solicitacoes = computed(() => pedidos.value.filter((item) => item.tipo === 'solicitacao'))

  async function execute(action) {
    pending.value++
    error.value = null
    try {
      return await action()
    } catch (err) {
      error.value = err.response?.data ?? { detail: err.message }
      throw err
    } finally {
      pending.value--
    }
  }

  function atualizarPedido(pedido) {
    const index = pedidos.value.findIndex((item) => item.id === pedido.id)
    if (index === -1) pedidos.value.unshift(pedido)
    else pedidos.value[index] = pedido
  }

  function getPedidos(params = {}) {
    return execute(async () => {
      const { data } = await service.getPedidos(params)
      pedidos.value = data.results ?? data
      total.value = data.count ?? pedidos.value.length
      next.value = data.next ?? null
      previous.value = data.previous ?? null
      return pedidos.value
    })
  }

  function getPendentes(params = {}) {
    return getPedidos({ ...params, status: 'pendente' })
  }

  function solicitarEntrada(projetoId) {
    return execute(async () => {
      const { data } = await service.solicitarEntrada(projetoId)
      atualizarPedido(data)
      return data
    })
  }

  function convidarUsuario(projetoId, usuarioId) {
    return execute(async () => {
      const { data } = await service.convidarUsuario(projetoId, usuarioId)
      atualizarPedido(data)
      return data
    })
  }

  function responder(id, aceitar) {
    return execute(async () => {
      const response = aceitar
        ? await service.aceitarPedido(id)
        : await service.recusarPedido(id)
      atualizarPedido(response.data)
      return response.data
    })
  }

  function aceitarPedido(id) {
    return responder(id, true)
  }

  function recusarPedido(id) {
    return responder(id, false)
  }

  function reset() {
    pedidos.value = []
    total.value = 0
    next.value = null
    previous.value = null
    error.value = null
  }

  return {
    pedidos, total, next, previous, loading, error,
    pendentes, convites, solicitacoes,
    getPedidos, getPendentes, solicitarEntrada, convidarUsuario,
    aceitarPedido, recusarPedido, reset,
  }
})
