import api from '@/api/config'

function validarProjeto(projetoId) {
  if (!projetoId) throw new Error('Selecione um projeto para consultar as tarefas.')
}

function tarefaPayload(data) {
  return Object.fromEntries(
    ['titulo', 'descricao', 'categoria', 'prioridade', 'status', 'prazo', 'responsavel']
      .filter((key) => data[key] !== undefined)
      .map((key) => [key, data[key]]),
  )
}

export default class TarefaService {
  getTarefas(projetoId, params = {}) {
    validarProjeto(projetoId)
    return api.get('/tarefas/', {
      params: { ...params, projeto: projetoId },
      paramsSerializer: { indexes: null },
    })
  }

  getTarefasAtrasadas(projetoId, params = {}) {
    validarProjeto(projetoId)
    return api.get('/tarefas/atrasadas/', { params: { ...params, projeto: projetoId } })
  }

  getTarefa(id, projetoId) {
    validarProjeto(projetoId)
    return api.get(`/tarefas/${id}/`, { params: { projeto: projetoId } })
  }

  createTarefa(projetoId, data) {
    validarProjeto(projetoId)
    return api.post('/tarefas/', { ...tarefaPayload(data), projeto: projetoId })
  }

  updateTarefa(id, projetoId, data) {
    validarProjeto(projetoId)
    return api.patch(`/tarefas/${id}/`, tarefaPayload(data), {
      params: { projeto: projetoId },
    })
  }

  deleteTarefa(id, projetoId) {
    validarProjeto(projetoId)
    return api.delete(`/tarefas/${id}/`, { params: { projeto: projetoId } })
  }
}
