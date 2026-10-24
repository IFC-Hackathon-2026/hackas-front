import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import StatusService from '@/services/statusService'

const statusService = new StatusService()

export const useStatusStore = defineStore('status', () => {
  const statuses = ref([])
  const projetoAtualId = ref(null)
  const error = ref(null)
  const pending = ref(0)
  let version = 0

  const loading = computed(() => pending.value > 0)
  const statusesOrdenados = computed(() =>
    [...statuses.value].sort((a, b) => a.ordem - b.ordem || a.id - b.id),
  )
  const statusInicial = computed(() => statusesOrdenados.value[0] ?? null)
  const statusesFinais = computed(() => statusesOrdenados.value.filter((item) => item.finaliza_task))

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

  // Carrega todas as páginas para não omitir colunas do quadro.
  function getStatuses(projetoId) {
    return execute(async () => {
      const requestVersion = ++version
      if (String(projetoAtualId.value) !== String(projetoId)) statuses.value = []
      projetoAtualId.value = projetoId
      const items = []
      let page = 1
      let hasNext
      do {
        const { data } = await statusService.getStatuses(projetoId, { page, page_size: 100 })
        items.push(...(data.results ?? data))
        hasNext = !Array.isArray(data) && (
          Boolean(data.next) || (data.total_pages != null && page < data.total_pages)
        )
        page++
      } while (hasNext)
      // Uma resposta antiga não deve substituir o projeto selecionado depois.
      if (requestVersion === version) statuses.value = items
      return items
    })
  }

  function atualizarCache(status, requestVersion) {
    if (requestVersion !== version || String(status.projeto) !== String(projetoAtualId.value)) return
    const index = statuses.value.findIndex((item) => item.id === status.id)
    if (index === -1) statuses.value.push(status)
    else statuses.value[index] = status
  }

  function getStatus(id, projetoId) {
    return execute(async () => {
      const requestVersion = version
      const { data } = await statusService.getStatus(id, projetoId)
      atualizarCache(data, requestVersion)
      return data
    })
  }

  function createStatus(projetoId, payload) {
    return execute(async () => {
      const requestVersion = version
      const { data } = await statusService.createStatus(projetoId, payload)
      atualizarCache(data, requestVersion)
      return data
    })
  }

  function updateStatus(id, projetoId, payload) {
    return execute(async () => {
      const requestVersion = version
      const { data } = await statusService.updateStatus(id, projetoId, payload)
      atualizarCache(data, requestVersion)
      return data
    })
  }

  function deleteStatus(id, projetoId) {
    return execute(async () => {
      const requestVersion = version
      await statusService.deleteStatus(id, projetoId)
      if (requestVersion === version && String(projetoId) === String(projetoAtualId.value)) {
        statuses.value = statuses.value.filter((item) => item.id !== id)
      }
    })
  }

  function reset() {
    version++
    statuses.value = []
    projetoAtualId.value = null
    error.value = null
  }

  return {
    statuses, projetoAtualId, loading, error,
    statusesOrdenados, statusInicial, statusesFinais,
    getStatuses, getStatus, createStatus, updateStatus, deleteStatus, reset,
  }
})
