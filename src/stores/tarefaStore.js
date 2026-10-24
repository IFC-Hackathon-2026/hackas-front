import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import TarefaService from '@/services/tarefaService'

const tarefaService = new TarefaService()

function criarTarefaBase() {
  return {
    id: null,
    atrasada: false,
    titulo: '',
    descricao: '',
    prioridade: 'baixa',
    prazo: null,
    criado_em: null,
    atualizado_em: null,
    concluido_em: null,
    situacao: 'pendente',
    projeto: null,
    status: null,
    criado_por: null,
    categoria: [],
    responsavel: [],
  }
}

function criarFiltrosBase() {
  return { search: '', categoria: [], responsavel: [], prioridade: '', prazo: '', atrasadas: false }
}

export const useTarefaStore = defineStore('tarefa', () => {
  const tarefa = ref(criarTarefaBase())

  function resetTarefa(projeto = null, status = null) {
    tarefa.value = { ...criarTarefaBase(), projeto, status }
  }

  const filtros = ref(criarFiltrosBase())

  function limparFiltros() {
    filtros.value = criarFiltrosBase()
  }

  const parametrosFiltros = computed(() => {
    const parametros = { page_size: 100 }
    if (filtros.value.search.trim()) parametros.search = filtros.value.search.trim()
    if (filtros.value.categoria.length) parametros.categoria = [...filtros.value.categoria]
    if (filtros.value.responsavel.length) parametros.responsavel = [...filtros.value.responsavel]
    if (filtros.value.prioridade) parametros.prioridade = filtros.value.prioridade
    if (filtros.value.atrasadas) parametros.atrasadas = 'true'
    return parametros
  })

  const tarefas = ref([])
  const tarefasAtrasadas = ref([])
  const totalAtrasadas = ref(0)
  const tarefasFiltradas = computed(() =>
    tarefas.value.filter((item) => {
      if (!filtros.value.prazo) return true
      if (!item.prazo) return false
      const data = /^\d{4}-\d{2}-\d{2}$/.test(item.prazo)
        ? item.prazo
        : new Date(item.prazo).toLocaleDateString('en-CA')
      return data === filtros.value.prazo
    }),
  )
  const tarefaAtual = ref(null)
  const projetoAtualId = ref(null)
  const total = ref(0)
  const next = ref(null)
  const previous = ref(null)
  const error = ref(null)
  const pending = ref(0)
  let version = 0

  const loading = computed(() => pending.value > 0)

  const porStatus = computed(() =>
    tarefas.value.reduce((grupos, tarefa) => {
      const statusId = tarefa.status?.id ?? tarefa.status
      ;(grupos[statusId] ??= []).push(tarefa)
      return grupos
    }, {}),
  )

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

  function atualizarCache(tarefa, requestVersion) {
    if (requestVersion !== version || String(tarefa.projeto) !== String(projetoAtualId.value))
      return
    const index = tarefas.value.findIndex((item) => item.id === tarefa.id)
    if (index === -1) tarefas.value.unshift(tarefa)
    else tarefas.value[index] = tarefa
    if (tarefaAtual.value?.id === tarefa.id) tarefaAtual.value = tarefa
    const indexAtrasada = tarefasAtrasadas.value.findIndex((item) => item.id === tarefa.id)
    if (tarefa.situacao === 'atrasada') {
      if (indexAtrasada === -1) {
        tarefasAtrasadas.value.unshift(tarefa)
        totalAtrasadas.value++
      } else tarefasAtrasadas.value[indexAtrasada] = tarefa
    } else if (indexAtrasada !== -1) {
      tarefasAtrasadas.value.splice(indexAtrasada, 1)
      totalAtrasadas.value = Math.max(0, totalAtrasadas.value - 1)
    }
  }

  function getTarefas(projetoId, params = {}, todas = false) {
    return execute(async () => {
      const requestVersion = ++version
      if (String(projetoAtualId.value) !== String(projetoId)) {
        tarefas.value = []
        tarefasAtrasadas.value = []
        totalAtrasadas.value = 0
      }
      projetoAtualId.value = projetoId
      let { data } = await tarefaService.getTarefas(projetoId, params)
      const items = [...(data.results ?? data)]
      let page = params.page ?? 1
      while (
        todas &&
        !Array.isArray(data) &&
        (data.next || (data.total_pages != null && page < data.total_pages))
      ) {
        if (requestVersion !== version) return items
        page++
        ;({ data } = await tarefaService.getTarefas(projetoId, { ...params, page }))
        items.push(...(data.results ?? data))
      }
      if (requestVersion === version) {
        tarefas.value = items
        total.value = data.count ?? items.length
        next.value = data.next ?? null
        previous.value = data.previous ?? null
      }
      return items
    })
  }

  function getTarefasAtrasadas(projetoId, params = {}) {
    return execute(async () => {
      if (String(projetoAtualId.value) !== String(projetoId)) {
        tarefas.value = []
        tarefasAtrasadas.value = []
        totalAtrasadas.value = 0
        projetoAtualId.value = projetoId
      }
      const { data } = await tarefaService.getTarefasAtrasadas(projetoId, params)
      if (String(projetoAtualId.value) === String(projetoId)) {
        tarefasAtrasadas.value = data.results ?? data
        totalAtrasadas.value = data.count ?? tarefasAtrasadas.value.length
      }
      return tarefasAtrasadas.value
    })
  }

  function getTarefasKanban(projetoId, statuses) {
    return execute(async () => {
      const requestVersion = ++version
      if (String(projetoAtualId.value) !== String(projetoId)) tarefas.value = []
      projetoAtualId.value = projetoId
      const parametros = { ...parametrosFiltros.value }
      const colunas = await Promise.all(
        statuses.map(async (status) => {
          const items = []
          let page = 1
          let temProxima
          do {
            const { data } = await tarefaService.getTarefas(projetoId, {
              ...parametros,
              status: status.id,
              page,
            })
            if (requestVersion !== version) return []
            const tarefasColuna = await Promise.all(
              (data.results ?? data).map(async (item) => {
                let tarefa = item
                // A listagem resumida não retorna a data de conclusão.
                if (
                  (item.situacao === 'concluida' || status.finaliza_task) &&
                  item.concluido_em === undefined
                ) {
                  const { data: detalhes } = await tarefaService.getTarefa(item.id, projetoId)
                  tarefa = { ...item, ...detalhes }
                }
                return {
                  ...tarefa,
                  projeto: tarefa.projeto ?? projetoId,
                  status: tarefa.status ?? status.id,
                }
              }),
            )
            items.push(...tarefasColuna)
            temProxima =
              !Array.isArray(data) &&
              (Boolean(data.next) || (data.total_pages != null && page < data.total_pages))
            page++
          } while (temProxima)
          return items
        }),
      )
      if (requestVersion !== version) return []
      tarefas.value = colunas.flat()
      total.value = tarefas.value.length
      next.value = null
      previous.value = null
      return tarefas.value
    })
  }

  function getTarefa(id, projetoId) {
    return execute(async () => {
      const requestVersion = version
      const { data } = await tarefaService.getTarefa(id, projetoId)
      atualizarCache(data, requestVersion)
      tarefaAtual.value = data
      return data
    })
  }

  function createTarefa(projetoId, payload) {
    return execute(async () => {
      const requestVersion = version
      const { data } = await tarefaService.createTarefa(projetoId, payload)
      atualizarCache(data, requestVersion)
      total.value++
      return data
    })
  }

  function updateTarefa(id, projetoId, payload) {
    return execute(async () => {
      const requestVersion = version
      const { data } = await tarefaService.updateTarefa(id, projetoId, payload)
      atualizarCache(data, requestVersion)
      return data
    })
  }

  function deleteTarefa(id, projetoId) {
    return execute(async () => {
      const requestVersion = version
      await tarefaService.deleteTarefa(id, projetoId)
      if (requestVersion === version && String(projetoId) === String(projetoAtualId.value)) {
        const eraAtrasada = tarefasAtrasadas.value.some((item) => item.id === id)
        tarefas.value = tarefas.value.filter((item) => item.id !== id)
        tarefasAtrasadas.value = tarefasAtrasadas.value.filter((item) => item.id !== id)
        total.value = Math.max(0, total.value - 1)
        if (eraAtrasada) totalAtrasadas.value = Math.max(0, totalAtrasadas.value - 1)
        if (tarefaAtual.value?.id === id) tarefaAtual.value = null
      }
    })
  }

  function reset() {
    version++
    resetTarefa()
    limparFiltros()
    tarefas.value = []
    tarefasAtrasadas.value = []
    totalAtrasadas.value = 0
    tarefaAtual.value = null
    projetoAtualId.value = null
    total.value = 0
    next.value = null
    previous.value = null
    error.value = null
  }

  return {
    filtros,
    parametrosFiltros,
    tarefasFiltradas,
    limparFiltros,
    getTarefasKanban,
    tarefasAtrasadas,
    totalAtrasadas,
    getTarefasAtrasadas,
    tarefa,
    tarefas,
    tarefaAtual,
    projetoAtualId,
    total,
    next,
    previous,
    loading,
    error,
    porStatus,
    getTarefas,
    getTarefa,
    createTarefa,
    updateTarefa,
    deleteTarefa,
    reset,
    resetTarefa,

  }
})
