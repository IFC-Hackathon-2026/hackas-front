import { computed, ref } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'
import DocumentoService from '@/services/documentoService'

const documentoService = new DocumentoService()

function validarNome(nome) {
  if (!nome?.trim() || nome.trim().length > 200) {
    throw new Error('Informe um título de até 200 caracteres.')
  }
}

function validarTarefa(tarefa) {
  if (!Number.isInteger(Number(tarefa)) || Number(tarefa) <= 0) {
    throw new Error('Selecione uma tarefa para vincular o documento.')
  }
}

function validarLink(link) {
  try {
    const endereco = new URL(link)
    if (['http:', 'https:'].includes(endereco.protocol)) return endereco.href
  } catch {
    // A mensagem abaixo também é usada para endereços incompletos.
  }
  throw new Error('Informe uma URL válida, começando com http:// ou https://.')
}

function validarArquivo(arquivo, descricao) {
  if (!(arquivo instanceof File) || !/\.pdf$/i.test(arquivo.name)) {
    throw new Error('Selecione um arquivo PDF.')
  }
  if (!arquivo.size) throw new Error('O arquivo PDF está vazio.')
  if (descricao.length > 255) throw new Error('A descrição deve ter até 255 caracteres.')
}

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
    const projetoId = documento.projeto?.id ?? documento.projeto ?? documento.tarefa_origem?.projeto
    return String(projetoId) === String(projetoAtualId.value)
  }

  function atualizarCache(documento, requestVersion) {
    if (requestVersion !== version || !pertenceAoProjeto(documento)) return
    const index = documentos.value.findIndex((item) => item.id === documento.id)
    if (index === -1) documentos.value.unshift(documento)
    else documentos.value[index] = documento
    if (documentoAtual.value?.id === documento.id) documentoAtual.value = documento
  }

  function getDocumentos(projetoId, params = {}, todas = false) {
    return execute(async () => {
      const requestVersion = ++version
      if (String(projetoAtualId.value) !== String(projetoId)) documentos.value = []
      projetoAtualId.value = projetoId
      let { data } = await documentoService.getDocumentos(projetoId, params)
      const items = [...(data.results ?? data)]
      let page = params.page ?? 1
      while (
        todas && !Array.isArray(data) &&
        (data.next || (data.total_pages != null && page < data.total_pages))
      ) {
        if (requestVersion !== version) return items
        page++
        ;({ data } = await documentoService.getDocumentos(projetoId, { ...params, page }))
        items.push(...(data.results ?? data))
      }
      if (requestVersion === version) {
        documentos.value = items
        total.value = data.count ?? items.length
        next.value = data.next ?? null
        previous.value = data.previous ?? null
      }
      return items
    })
  }

  // Retorna os documentos da tarefa sem substituir a listagem do projeto.
  function getDocumentosDaTarefa(projetoId, tarefaId) {
    return execute(async () => {
      if (!tarefaId) throw new Error('Informe a tarefa para consultar seus documentos.')
      const items = []
      let page = 1
      let temProxima
      do {
        const { data } = await documentoService.getDocumentos(projetoId, {
          tarefa: tarefaId, page, page_size: 100,
        })
        items.push(...(data.results ?? data))
        temProxima = !Array.isArray(data) &&
          (Boolean(data.next) || (data.total_pages != null && page < data.total_pages))
        page++
      } while (temProxima)
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
      validarNome(payload.nome)
      validarTarefa(payload.tarefa)
      const dados = { ...payload, nome: payload.nome.trim() }
      if (payload.url !== undefined) dados.url = validarLink(payload.url.trim())
      const { data } = await documentoService.createDocumento(dados)
      atualizarCache(data, requestVersion)
      if (requestVersion === version && pertenceAoProjeto(data)) total.value++
      return data
    })
  }

  function uploadAndCreate({ file, nome, projeto, tarefa, description = '' }) {
    return execute(async () => {
      const requestVersion = version
      try {
        validarArquivo(file, description)
        validarNome(nome)
        validarTarefa(tarefa)
        const { data } = await documentoService.createDocumentoComArquivo({
          file, nome: nome.trim(), projeto, tarefa, description,
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

  function uploadDocumento(arquivo, descricao = '') {
    return execute(async () => {
      validarArquivo(arquivo, descricao)
      const { data } = await documentoService.uploadDocumento(arquivo, descricao)
      return data
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
    getDocumentos, getDocumentosDaTarefa, getDocumento, createDocumento, uploadAndCreate, uploadDocumento, updateDocumento,
    deleteDocumento, reset,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDocumentoStore, import.meta.hot))
}
