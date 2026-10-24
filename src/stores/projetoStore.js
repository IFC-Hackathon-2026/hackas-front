import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import ProjetoService from '@/services/projetoService'
import { useUserStore } from '@/stores/userStore'

const projetoService = new ProjetoService()

export const useProjetoStore = defineStore('projeto', () => {
  const userStore = useUserStore()
  let selecao = 0
  let consultaAtual = null
  let idConsulta = null
  const projetos = ref([])
  const projetoAtual = ref(null)
  const total = ref(0)
  const next = ref(null)
  const previous = ref(null)
  const error = ref(null)
  const pending = ref(0)
  const loading = computed(() => pending.value > 0)

  const participantes = computed(() =>
    (projetoAtual.value?.participacoes ?? []).map(({ usuario, cargo, entrou_em }) => ({
      ...usuario,
      cargo,
      entrou_em,
    })),
  )
  const meuCargo = computed(() => projetoAtual.value?.meu_cargo ?? null)
  const podeEditar = computed(() => ['fundador', 'organizador'].includes(meuCargo.value))
  const podeExcluir = computed(() => {
    const usuarioId = userStore.user?.id
    const criador = projetoAtual.value?.criador
    const criadorId = typeof criador === 'object' ? criador?.id : criador
    return meuCargo.value === 'fundador' || (
      usuarioId != null && criadorId != null && String(usuarioId) === String(criadorId)
    )
  })
  const podeConfigurar = computed(() => podeExcluir.value || meuCargo.value === 'organizador')

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

  function atualizarCache(projeto) {
    const index = projetos.value.findIndex((item) => item.id === projeto.id)
    if (index !== -1) projetos.value[index] = projeto
    if (projetoAtual.value?.id === projeto.id) projetoAtual.value = projeto
  }

  // params aceita meus, search e os parâmetros de paginação da API.
  function getProjetos(params = {}) {
    return execute(async () => {
      const { data } = await projetoService.getProjetos(params)
      projetos.value = data.results ?? data
      total.value = data.count ?? projetos.value.length
      next.value = data.next ?? null
      previous.value = data.previous ?? null
      return projetos.value
    })
  }

  function getMeusProjetos(params = {}) {
    return getProjetos({ ...params, meus: 'true' })
  }

  function getProjeto(id) {
    return execute(async () => {
      const { data } = await projetoService.getProjeto(id)
      atualizarCache(data)
      return data
    })
  }

  function selecionarProjeto(id) {
    if (consultaAtual && idConsulta === String(id)) return consultaAtual
    const atual = ++selecao
    idConsulta = String(id)
    // Busca os detalhes para manter participações e permissões atualizadas.
    projetoAtual.value = null
    consultaAtual = (async () => {
      try {
        if (!userStore.user && userStore.isAuthenticated) await userStore.getMe()
        const projeto = await getProjeto(id)
        if (atual === selecao) projetoAtual.value = projeto
        return projeto
      } finally {
        if (atual === selecao) {
          consultaAtual = null
          idConsulta = null
        }
      }
    })()
    return consultaAtual
  }

  function createProjeto(payload) {
    return execute(async () => {
      const { data } = await projetoService.createProjeto(payload)
      projetoAtual.value = data
      // Recarregue a listagem com os filtros atuais para incluir o novo projeto.
      return data
    })
  }

  function updateProjeto(id, payload) {
    return execute(async () => {
      const { data } = await projetoService.updateProjeto(id, payload)
      atualizarCache(data)
      return data
    })
  }

  function deleteProjeto(id) {
    return execute(async () => {
      await projetoService.deleteProjeto(id)
      const index = projetos.value.findIndex((item) => item.id === id)
      if (index !== -1) projetos.value.splice(index, 1)
      total.value = Math.max(0, total.value - 1)
      if (projetoAtual.value?.id === id) projetoAtual.value = null
    })
  }

  function updatePhoto(id, file) {
    return execute(async () => {
      const { data: image } = await projetoService.uploadImage(file)
      const { data } = await projetoService.updateProjeto(id, {
        foto_attachment_key: image.attachment_key,
      })
      atualizarCache(data)
      return data
    })
  }

  function reset() {
    selecao++
    consultaAtual = null
    idConsulta = null
    projetos.value = []
    projetoAtual.value = null
    total.value = 0
    next.value = null
    previous.value = null
    error.value = null
  }

  return {
    projetos, projetoAtual, total, next, previous, loading, error,
    participantes, meuCargo, podeEditar, podeExcluir, podeConfigurar,
    getProjetos, getMeusProjetos, getProjeto, selecionarProjeto,
    createProjeto, updateProjeto, deleteProjeto, updatePhoto, reset,
  }
})
