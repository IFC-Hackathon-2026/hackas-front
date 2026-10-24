import api from '@/api/config'

function statusPayload(data) {
  return Object.fromEntries(
    ['nome', 'cor', 'ordem', 'finaliza_task']
      .filter((key) => data[key] !== undefined)
      .map((key) => [key, data[key]]),
  )
}

function validarProjeto(projetoId) {
  if (!projetoId) throw new Error('Selecione um projeto para consultar os status.')
}

export default class StatusService {
  getStatuses(projetoId, params = {}) {
    validarProjeto(projetoId)
    return api.get('/status/', { params: { ...params, projeto: projetoId } })
  }

  getStatus(id, projetoId) {
    validarProjeto(projetoId)
    return api.get(`/status/${id}/`, { params: { projeto: projetoId } })
  }

  createStatus(projetoId, data) {
    validarProjeto(projetoId)
    return api.post('/status/', { ...statusPayload(data), projeto: projetoId })
  }

  updateStatus(id, projetoId, data) {
    validarProjeto(projetoId)
    return api.patch(`/status/${id}/`, statusPayload(data), {
      params: { projeto: projetoId },
    })
  }

  deleteStatus(id, projetoId) {
    validarProjeto(projetoId)
    return api.delete(`/status/${id}/`, { params: { projeto: projetoId } })
  }
}
