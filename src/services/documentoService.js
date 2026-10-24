import api from '@/api/config'

function validarProjeto(projetoId) {
  if (!projetoId) throw new Error('Selecione um projeto para consultar os documentos.')
}

function documentoPayload(data) {
  return Object.fromEntries(
    ['nome', 'projeto', 'tarefa', 'url', 'arquivo_attachment_key']
      .filter((key) => data[key] !== undefined)
      .map((key) => [key, data[key]]),
  )
}

export default class DocumentoService {
  getDocumentos(projetoId, params = {}) {
    validarProjeto(projetoId)
    return api.get('/documentos/', { params: { ...params, projeto: projetoId } })
  }

  getDocumento(id) {
    return api.get(`/documentos/${id}/`)
  }

  uploadDocumento(file, description = '') {
    const formData = new FormData()
    formData.append('file', file)
    if (description) formData.append('description', description)
    // O navegador/Axios adiciona o boundary correto do multipart automaticamente.
    return api.post('/media/documents/', formData)
  }

  createDocumento(data) {
    return api.post('/documentos/', documentoPayload(data))
  }

  createDocumentoComArquivo({ file, nome, projeto, tarefa, description = '' }) {
    const formData = new FormData()
    formData.append('arquivo_upload', file)
    formData.append('nome', nome)
    if (projeto != null) formData.append('projeto', projeto)
    if (tarefa != null) formData.append('tarefa', tarefa)
    if (description) formData.append('descricao_arquivo', description)
    return api.post('/documentos/', formData)
  }

  updateDocumento(id, data) {
    return api.patch(`/documentos/${id}/`, documentoPayload(data))
  }

  deleteDocumento(id) {
    return api.delete(`/documentos/${id}/`)
  }
}
