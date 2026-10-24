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
  const convitesEmEnvio = new Set()
  const pedidosPendentes = ref(new Map())
  const idDe = (valor) => valor && typeof valor === 'object' ? valor.id : valor
  const chavePedido = (projeto, usuario) => `${idDe(projeto)}:${idDe(usuario)}`

  function registrarPedido(pedido) {
    const chave = chavePedido(pedido.projeto ?? pedido.projeto_detalhe, pedido.usuario ?? pedido.usuario_detalhe)
    if (pedido.status === 'pendente') pedidosPendentes.value.set(chave, pedido)
    else if (pedidosPendentes.value.get(chave)?.id === pedido.id) pedidosPendentes.value.delete(chave)
  }

  function temPedidoPendente(projetoId, usuarioId) {
    return pedidosPendentes.value.has(chavePedido(projetoId, usuarioId))
  }

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
    registrarPedido(pedido)
    const index = pedidos.value.findIndex((item) => item.id === pedido.id)
    if (index === -1) pedidos.value.unshift(pedido)
    else pedidos.value[index] = pedido
  }

  function getPedidos(params = {}) {
    return execute(async () => {
      const { data } = await service.getPedidos(params)
      pedidos.value = data.results ?? data
      pedidos.value.forEach(registrarPedido)
      total.value = data.count ?? pedidos.value.length
      next.value = data.next ?? null
      previous.value = data.previous ?? null
      return pedidos.value
    })
  }

  async function carregarPendentesProjeto(projetoId) {
    const lista = []
    let params = { projeto: projetoId, page_size: 100 }
    do {
      const { data } = await service.getPedidos(params)
      const pagina = Array.isArray(data) ? data : data.results
      if (!Array.isArray(pagina)) throw new Error('Não foi possível verificar os convites existentes.')
      lista.push(...pagina)
      params = data.next
        ? { ...Object.fromEntries(new URL(data.next, 'http://localhost').searchParams), projeto: projetoId }
        : null
    } while (params)
    // A consulta completa atualiza o estado inclusive após recarregar a página.
    for (const [chave, pedido] of pedidosPendentes.value) {
      if (String(idDe(pedido.projeto ?? pedido.projeto_detalhe)) === String(projetoId)) pedidosPendentes.value.delete(chave)
    }
    lista.filter((pedido) => String(idDe(pedido.projeto ?? pedido.projeto_detalhe)) === String(projetoId)).forEach(registrarPedido)
    return lista
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

  async function convidarUsuario(projetoId, usuarioId) {
    const chave = chavePedido(projetoId, usuarioId)
    if (convitesEmEnvio.has(chave) || temPedidoPendente(projetoId, usuarioId)) {
      throw new Error('Já existe um convite ou pedido pendente para esta pessoa neste evento.')
    }
    // A trava pertence à store e continua ativa ao trocar de aba.
    convitesEmEnvio.add(chave)
    try {
      return await execute(async () => {
        await carregarPendentesProjeto(projetoId)
        if (temPedidoPendente(projetoId, usuarioId)) {
          throw new Error('Esta pessoa já tem um convite ou pedido pendente neste evento.')
        }
        const { data } = await service.convidarUsuario(projetoId, usuarioId)
        atualizarPedido(data)
        return data
      })
    } finally {
      convitesEmEnvio.delete(chave)
    }
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
    pedidosPendentes.value.clear()
    total.value = 0
    next.value = null
    previous.value = null
    error.value = null
  }

  return {
    pedidos, total, next, previous, loading, error,
    pendentes, convites, solicitacoes,
    getPedidos, getPendentes, solicitarEntrada, convidarUsuario, temPedidoPendente, carregarPendentesProjeto,
    aceitarPedido, recusarPedido, reset,
  }
})
