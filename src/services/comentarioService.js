import api from '@/api/config'

function validarTarefa(tarefaId) {
  if (!tarefaId) throw new Error('Selecione uma tarefa para consultar os comentários.')
}

function comentarioPayload(data) {
  return Object.fromEntries(
    ['conteudo']
      .filter((key) => data[key] !== undefined)
      .map((key) => [key, data[key]]),
  )
}

export default class ComentarioService {
  getComentarios(tarefaId, params = {}) {
    validarTarefa(tarefaId)
    return api.get('/comentarios/', { params: { ...params, tarefa: tarefaId } })
  }

  getComentario(id, tarefaId) {
    validarTarefa(tarefaId)
    return api.get(`/comentarios/${id}/`, { params: { tarefa: tarefaId } })
  }

  createComentario(tarefaId, data) {
    validarTarefa(tarefaId)
    return api.post('/comentarios/', { ...comentarioPayload(data), tarefa: tarefaId })
  }

  updateComentario(id, tarefaId, data) {
    validarTarefa(tarefaId)
    return api.patch(`/comentarios/${id}/`, comentarioPayload(data), {
      params: { tarefa: tarefaId },
    })
  }

  deleteComentario(id, tarefaId) {
    validarTarefa(tarefaId)
    return api.delete(`/comentarios/${id}/`, { params: { tarefa: tarefaId } })
  }
}
