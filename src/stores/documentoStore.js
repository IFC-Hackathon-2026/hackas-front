import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import DocumentoService from '@/services/documentoService'

const documentoService = new DocumentoService()

export const useDocumentoStore = defineStore('documento', () => {
  const documentos = ref([])
  const documentoAtual = ref(null)
  const projetoAtualId = ref(null)
  const total = ref(0)
  const next = ref(null)
  const previous = ref(null)
  const error = ref(null)
  const pending = ref(0)
  let version = 0

  const loading = computed(() => pending.value > 0)
  const porTarefa = computed(() => documentos.value.reduce((grupos, documento) => {
    const tarefaId = documento.tarefa_origem?.id
    if (tarefaId != null) (grupos[tarefaId] ??= []).push(documento)
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

  function pertenceAoProjeto(documento) {
    return String(documento.tarefa_origem?.projeto) === String(projetoAtualId.value)
  }

  function atualizarCache(documento, requestVersion) {
    if (requestVersion !== version || !pertenceAoProjeto(documento)) return
    const index = documentos.value.findIndex((item) => item.id === documento.id)
    if (index === -1) documentos.value.unshift(documento)
    else documentos.value[index] = documento
    if (documentoAtual.value?.id === documento.id) documentoAtual.value = documento
  }

  function getDocumentos(projetoId, params = {}) {
    return execute(async () => {
      const requestVersion = ++version
      if (String(projetoAtualId.value) !== String(projetoId)) documentos.value = []
      projetoAtualId.value = projetoId
      const { data } = await documentoService.getDocumentos(projetoId, params)
      const items = data.results ?? data
      if (requestVersion === version) {
        documentos.value = items
        total.value = data.count ?? items.length
        next.value = data.next ?? null
        previous.value = data.previous ?? null
      }
      return items
    })
  }

  function getDocumento(id) {
    return execute(async () => {
      const requestVersion = version
      const { data } = await documentoService.getDocumento(id)
      atualizarCache(data, requestVersion)
      if (requestVersion === version) documentoAtual.value = data
      return data
    })
  }

  function createDocumento(payload) {
    return execute(async () => {
      const requestVersion = version
      const { data } = await documentoService.createDocumento(payload)
      atualizarCache(data, requestVersion)
      if (requestVersion === version && pertenceAoProjeto(data)) total.value++
      return data
    })
  }

  function uploadAndCreate({ file, nome, tarefa, description = '' }) {
    return execute(async () => {
      const requestVersion = version
      try {
        const { data } = await documentoService.createDocumentoComArquivo({
          file, nome, tarefa, description,
        })
        atualizarCache(data, requestVersion)
        if (requestVersion === version && pertenceAoProjeto(data)) total.value++
        return data
      } catch (err) {
        err.documentoStage = 'criação e vínculo do documento com a tarefa'
        throw err
      }
    })
  }

  function updateDocumento(id, payload) {
    return execute(async () => {
      const requestVersion = version
      const { data } = await documentoService.updateDocumento(id, payload)
      atualizarCache(data, requestVersion)
      return data
    })
  }

  function deleteDocumento(id) {
    return execute(async () => {
      const requestVersion = version
      await documentoService.deleteDocumento(id)
      if (requestVersion === version) {
        documentos.value = documentos.value.filter((item) => item.id !== id)
        total.value = Math.max(0, total.value - 1)
        if (documentoAtual.value?.id === id) documentoAtual.value = null
      }
    })
  }

  function reset() {
    version++
    documentos.value = []
    documentoAtual.value = null
    projetoAtualId.value = null
    total.value = 0
    next.value = null
    previous.value = null
    error.value = null
  }

  return {
    documentos, documentoAtual, projetoAtualId, total, next, previous, loading, error, porTarefa,
    getDocumentos, getDocumento, createDocumento, uploadAndCreate, updateDocumento,
    deleteDocumento, reset,
  }
})
