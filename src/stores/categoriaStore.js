import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import CategoriaService from '@/services/categoriaService'

const categoriaService = new CategoriaService()

export const useCategoriaStore = defineStore('categoria', () => {
  const categorias = ref([])
  const projetoAtualId = ref(null)
  const error = ref(null)
  const pending = ref(0)
  let version = 0

  const loading = computed(() => pending.value > 0)
  const categoriasOrdenadas = computed(() =>
    [...categorias.value].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
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

  function atualizarCache(categoria, requestVersion) {
    if (requestVersion !== version || String(categoria.projeto) !== String(projetoAtualId.value)) return
    const index = categorias.value.findIndex((item) => item.id === categoria.id)
    if (index === -1) categorias.value.push(categoria)
    else categorias.value[index] = categoria
  }

  function getCategorias(projetoId) {
    return execute(async () => {
      const requestVersion = ++version
      if (String(projetoAtualId.value) !== String(projetoId)) categorias.value = []
      projetoAtualId.value = projetoId
      const items = []
      let page = 1
      let hasNext
      do {
        const { data } = await categoriaService.getCategorias(projetoId, { page, page_size: 100 })
        items.push(...(data.results ?? data))
        hasNext = !Array.isArray(data) && (
          Boolean(data.next) || (data.total_pages != null && page < data.total_pages)
        )
        page++
      } while (hasNext)
      if (requestVersion === version) categorias.value = items
      return items
    })
  }

  function getCategoria(id, projetoId) {
    return execute(async () => {
      const requestVersion = version
      const { data } = await categoriaService.getCategoria(id, projetoId)
      atualizarCache(data, requestVersion)
      return data
    })
  }

  function createCategoria(projetoId, payload) {
    return execute(async () => {
      const requestVersion = version
      const { data } = await categoriaService.createCategoria(projetoId, payload)
      atualizarCache(data, requestVersion)
      return data
    })
  }

  function updateCategoria(id, projetoId, payload) {
    return execute(async () => {
      const requestVersion = version
      const { data } = await categoriaService.updateCategoria(id, projetoId, payload)
      atualizarCache(data, requestVersion)
      return data
    })
  }

  function deleteCategoria(id, projetoId) {
    return execute(async () => {
      const requestVersion = version
      await categoriaService.deleteCategoria(id, projetoId)
      if (requestVersion === version && String(projetoId) === String(projetoAtualId.value)) {
        categorias.value = categorias.value.filter((item) => item.id !== id)
      }
    })
  }

  function reset() {
    version++
    categorias.value = []
    projetoAtualId.value = null
    error.value = null
  }

  return {
    categorias, projetoAtualId, loading, error, categoriasOrdenadas,
    getCategorias, getCategoria, createCategoria, updateCategoria, deleteCategoria, reset,
  }
})
