import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import ComentarioService from '@/services/comentarioService'

const comentarioService = new ComentarioService()

export const useComentarioStore = defineStore('comentario', () => {
  const comentarios = ref([])
  const comentarioAtual = ref(null)
  const tarefaAtualId = ref(null)
  const total = ref(0)
  const next = ref(null)
  const previous = ref(null)
  const error = ref(null)
  const pending = ref(0)
  let version = 0

  const loading = computed(() => pending.value > 0)

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

  function pertenceATarefa(comentario) {
    return String(comentario.tarefa) === String(tarefaAtualId.value)
  }

  function atualizarCache(comentario, requestVersion) {
    if (requestVersion !== version || !pertenceATarefa(comentario)) return
    const index = comentarios.value.findIndex((item) => item.id === comentario.id)
    if (index === -1) comentarios.value.push(comentario)
    else comentarios.value[index] = comentario
    if (comentarioAtual.value?.id === comentario.id) comentarioAtual.value = comentario
  }

  function getComentarios(tarefaId, params = {}) {
    return execute(async () => {
      const requestVersion = ++version
      if (String(tarefaAtualId.value) !== String(tarefaId)) {
        comentarios.value = []
        comentarioAtual.value = null
        total.value = 0
        next.value = null
        previous.value = null
      }
      tarefaAtualId.value = tarefaId
      const { data } = await comentarioService.getComentarios(tarefaId, params)
      const items = data.results ?? data
      if (requestVersion === version) {
        comentarios.value = items
        comentarioAtual.value = null
        total.value = data.count ?? items.length
        next.value = data.next ?? null
        previous.value = data.previous ?? null
      }
      return items
    })
  }

  function getComentario(id, tarefaId = tarefaAtualId.value) {
    return execute(async () => {
      const requestVersion = version
      const { data } = await comentarioService.getComentario(id, tarefaId)
      atualizarCache(data, requestVersion)
      if (requestVersion === version) comentarioAtual.value = data
      return data
    })
  }

  function createComentario(tarefaId, payload) {
    return execute(async () => {
      const requestVersion = version
      const { data } = await comentarioService.createComentario(tarefaId, payload)
      atualizarCache(data, requestVersion)
      if (requestVersion === version && pertenceATarefa(data)) total.value++
      return data
    })
  }

  function updateComentario(id, tarefaId, payload) {
    return execute(async () => {
      const requestVersion = version
      const { data } = await comentarioService.updateComentario(id, tarefaId, payload)
      atualizarCache(data, requestVersion)
      return data
    })
  }

  function deleteComentario(id, tarefaId = tarefaAtualId.value) {
    return execute(async () => {
      const requestVersion = version
      await comentarioService.deleteComentario(id, tarefaId)
      if (requestVersion === version) {
        comentarios.value = comentarios.value.filter((item) => item.id !== id)
        total.value = Math.max(0, total.value - 1)
        if (comentarioAtual.value?.id === id) comentarioAtual.value = null
      }
    })
  }

  function selecionarComentario(comentario) {
    comentarioAtual.value = comentario
  }

  function reset() {
    version++
    comentarios.value = []
    comentarioAtual.value = null
    tarefaAtualId.value = null
    total.value = 0
    next.value = null
    previous.value = null
    error.value = null
  }

  return {
    comentarios, comentarioAtual, tarefaAtualId, total, next, previous, loading, error,
    getComentarios, getComentario, createComentario, updateComentario, deleteComentario,
    selecionarComentario, reset,
  }
})
