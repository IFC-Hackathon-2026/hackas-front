import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import TarefaService from '@/services/tarefaService'

const tarefaService = new TarefaService()

function criarTarefaBase() {
  return {
    id: null,
    titulo: '',
    descricao: '',
    prioridade: 'baixa',
    prazo: null,
    criado_em: null,
    atualizado_em: null,
    concluido_em: null,
    projeto: null,
    status: null,
    criado_por: null,
    categoria: [],
    responsavel: [],
  }
}

export const useTarefaStore = defineStore('tarefa', () => {
  const tarefa = ref(criarTarefaBase())

  function resetTarefa(projeto = null, status = null) {
    tarefa.value = { ...criarTarefaBase(), projeto, status }
  }

  const tarefas = ref([])
  const tarefaAtual = ref(null)
  const projetoAtualId = ref(null)
  const total = ref(0)
  const next = ref(null)
  const previous = ref(null)
  const error = ref(null)
  const pending = ref(0)
  let version = 0

  const loading = computed(() => pending.value > 0)
  const porStatus = computed(() => tarefas.value.reduce((grupos, tarefa) => {
    const statusId = tarefa.status?.id ?? tarefa.status
    ;(grupos[statusId] ??= []).push(tarefa)
    return grupos
  }, {}))

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
    if (requestVersion !== version || String(tarefa.projeto) !== String(projetoAtualId.value)) return
    const index = tarefas.value.findIndex((item) => item.id === tarefa.id)
    if (index === -1) tarefas.value.unshift(tarefa)
    else tarefas.value[index] = tarefa
    if (tarefaAtual.value?.id === tarefa.id) tarefaAtual.value = tarefa
  }

  function getTarefas(projetoId, params = {}, todas = false) {
    return execute(async () => {
      const requestVersion = ++version
      if (String(projetoAtualId.value) !== String(projetoId)) tarefas.value = []
      projetoAtualId.value = projetoId
      let { data } = await tarefaService.getTarefas(projetoId, params)
      const items = [...(data.results ?? data)]
      let page = params.page ?? 1
      while (todas && !Array.isArray(data) && (data.next || (data.total_pages != null && page < data.total_pages))) {
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
        tarefas.value = tarefas.value.filter((item) => item.id !== id)
        total.value = Math.max(0, total.value - 1)
        if (tarefaAtual.value?.id === id) tarefaAtual.value = null
      }
    })
  }

  function reset() {
    version++
    resetTarefa()
    tarefas.value = []
    tarefaAtual.value = null
    projetoAtualId.value = null
    total.value = 0
    next.value = null
    previous.value = null
    error.value = null
  }

  return {
    tarefa, tarefas, tarefaAtual, projetoAtualId, total, next, previous, loading, error, porStatus,
    getTarefas, getTarefa, createTarefa, updateTarefa, deleteTarefa, reset, resetTarefa,
  }
})
