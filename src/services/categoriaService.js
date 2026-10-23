import api from '@/api/config'

function validarProjeto(projetoId) {
  if (!projetoId) throw new Error('Selecione um projeto para consultar as categorias.')
}

function categoriaPayload(data) {
  return Object.fromEntries(
    ['nome', 'cor']
      .filter((key) => data[key] !== undefined)
      .map((key) => [key, data[key]]),
  )
}

export default class CategoriaService {
  getCategorias(projetoId, params = {}) {
    validarProjeto(projetoId)
    return api.get('/categorias/', { params: { ...params, projeto: projetoId } })
  }

  getCategoria(id, projetoId) {
    validarProjeto(projetoId)
    return api.get(`/categorias/${id}/`, { params: { projeto: projetoId } })
  }

  createCategoria(projetoId, data) {
    validarProjeto(projetoId)
    return api.post('/categorias/', { ...categoriaPayload(data), projeto: projetoId })
  }

  updateCategoria(id, projetoId, data) {
    validarProjeto(projetoId)
    return api.patch(`/categorias/${id}/`, categoriaPayload(data), {
      params: { projeto: projetoId },
    })
  }

  deleteCategoria(id, projetoId) {
    validarProjeto(projetoId)
    return api.delete(`/categorias/${id}/`, { params: { projeto: projetoId } })
  }
}
