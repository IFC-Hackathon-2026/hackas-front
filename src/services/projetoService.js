import api from '@/api/config'

// Somente estes campos são graváveis no ProjetoSerializer.
function projetoPayload(data) {
  return Object.fromEntries(
    ['nome', 'descricao', 'foto_attachment_key', 'categorias']
      .filter((key) => data[key] !== undefined)
      .map((key) => [key, data[key]]),
  )
}

export default class ProjetoService {
  getProjetos(params = {}) {
    const categorias = Array.isArray(params.categorias)
      ? params.categorias.join(',')
      : params.categorias
    return api.get('/projetos/', { params: { ...params, categorias } })
  }

  getProjeto(id) {
    return api.get(`/projetos/${id}/`)
  }

  getProjetosDestaque() {
    return api.get('/projetos/destaques/')
  }

  removeParticipante(projetoId, participacaoId) {
    return api.delete(`/projetos/${projetoId}/participantes/${participacaoId}/`)
  }

  createProjeto(data) {
    return api.post('/projetos/', projetoPayload(data))
  }

  updateProjeto(id, data) {
    return api.patch(`/projetos/${id}/`, projetoPayload(data))
  }

  deleteProjeto(id) {
    return api.delete(`/projetos/${id}/`)
  }

  updateParticipante(projetoId, participacaoId, cargo) {
    return api.patch(`/projetos/${projetoId}/participantes/${participacaoId}/`, { cargo })
  }

  deleteParticipante(projetoId, participacaoId) {
    return api.delete(`/projetos/${projetoId}/participantes/${participacaoId}/`)
  }

  uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/media/images/', formData)
  }
}
