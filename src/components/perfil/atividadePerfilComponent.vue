<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/api/config'
import PedidoParticipacaoService from '@/services/pedidoParticipacaoService'
import ProjetoService from '@/services/projetoService'
import StatusService from '@/services/statusService'
import TarefaService from '@/services/tarefaService'
import { prioridades } from '@/constants/prioridades'
import { usePedidoParticipacaoStore } from '@/stores/pedidoParticipacaoStore'
import { useUserStore } from '@/stores/userStore'

const pedidoService = new PedidoParticipacaoService()
const projetoService = new ProjetoService()
const statusService = new StatusService()
const tarefaService = new TarefaService()
const pedidoStore = usePedidoParticipacaoStore()
const userStore = useUserStore()

const pedidos = ref([])
const projetos = ref(new Map())
const pendencias = ref([])
const carregando = ref(true)
const respondendoId = ref(null)
const excluindoId = ref(null)
const erro = ref('')
const mensagem = ref('')
const imagensComErro = ref(new Set())
const coresPorStatus = new Map([
  ['pendente', '#fd151b'],
  ['a fazer', '#fd151b'],
  ['em andamento', '#ffb30f'],
  ['andamento', '#ffb30f'],
  ['concluido', '#849324'],
  ['concluida', '#849324'],
])

const usuarioId = computed(() => userStore.user?.id)

function mesmoId(valor, id) {
  return String(valor?.id ?? valor ?? '') === String(id ?? '')
}

const convitesRecebidos = computed(() =>
  pedidos.value.filter(
    (pedido) =>
      pedido.tipo === 'convite' &&
      pedido.status === 'pendente' &&
      mesmoId(pedido.usuario_detalhe ?? pedido.usuario, usuarioId.value) &&
      !mesmoId(pedido.criado_por, usuarioId.value),
  ),
)

const convitesEnviadosPendentes = computed(() =>
  pedidos.value.filter(
    (pedido) =>
      pedido.tipo === 'convite' &&
      pedido.status === 'pendente' &&
      mesmoId(pedido.criado_por, usuarioId.value) &&
      !mesmoId(pedido.usuario_detalhe ?? pedido.usuario, usuarioId.value),
  ),
)

const convitesEnviadosRecusados = computed(() =>
  pedidos.value.filter(
    (pedido) =>
      pedido.tipo === 'convite' &&
      pedido.status === 'recusado' &&
      mesmoId(pedido.criado_por, usuarioId.value),
  ),
)

function itensDaResposta(data) {
  return data?.results ?? data ?? []
}

async function buscarTodasPaginas(buscar, params = {}) {
  const itens = []
  let pagina = 1
  let temProxima

  do {
    const { data } = await buscar({ ...params, page: pagina, page_size: 100 })
    itens.push(...itensDaResposta(data))
    temProxima =
      !Array.isArray(data) &&
      (Boolean(data.next) || (data.total_pages != null && pagina < data.total_pages))
    pagina++
  } while (temProxima)

  return itens
}

function idProjetoPedido(pedido) {
  return pedido.projeto_detalhe?.id ?? pedido.projeto
}

function projetoDoPedido(pedido) {
  const id = idProjetoPedido(pedido)
  return projetos.value.get(String(id)) ?? pedido.projeto_detalhe ?? { id, nome: 'Evento' }
}

function urlImagem(projeto) {
  const url = projeto?.foto?.url ?? projeto?.imagem?.url ?? projeto?.foto
  if (!url || typeof url !== 'string') return ''
  if (/^https?:\/\//.test(url)) return url
  return new URL(url, new URL(api.defaults.baseURL, window.location.origin).origin).href
}

function imagemDisponivel(projeto) {
  return urlImagem(projeto) && !imagensComErro.value.has(String(projeto?.id))
}

function registrarErroImagem(projeto) {
  const falhas = new Set(imagensComErro.value)
  falhas.add(String(projeto?.id))
  imagensComErro.value = falhas
}

async function carregarProjetosDosPedidos(lista) {
  const ids = [...new Set(lista.map(idProjetoPedido).filter(Boolean))]
  const resultados = await Promise.allSettled(
    ids.map(async (id) => {
      const { data } = await projetoService.getProjeto(id)
      return data
    }),
  )

  const mapa = new Map(projetos.value)
  resultados.forEach((resultado) => {
    if (resultado.status === 'fulfilled') mapa.set(String(resultado.value.id), resultado.value)
  })
  projetos.value = mapa
}

async function carregarPedidos() {
  const lista = await buscarTodasPaginas((params) => pedidoService.getPedidos(params))
  pedidos.value = lista
  await carregarProjetosDosPedidos(lista)
}

function idStatus(tarefa) {
  return tarefa.status?.id ?? tarefa.status
}

function estaConcluida(tarefa, status) {
  return tarefa.situacao === 'concluida' || Boolean(tarefa.concluido_em) || Boolean(status?.finaliza_task)
}

function pesoPendencia(tarefa) {
  if (tarefa.atrasada || tarefa.situacao === 'atrasada') return 0
  return { urgente: 1, alta: 2, media: 3, baixa: 4 }[tarefa.prioridade] ?? 5
}

function prazoOrdenacao(tarefa) {
  if (!tarefa.prazo) return Number.MAX_SAFE_INTEGER
  const data = new Date(tarefa.prazo).getTime()
  return Number.isNaN(data) ? Number.MAX_SAFE_INTEGER : data
}

function ordenarPendencias(a, b) {
  return (
    pesoPendencia(a) - pesoPendencia(b) ||
    prazoOrdenacao(a) - prazoOrdenacao(b) ||
    a.titulo.localeCompare(b.titulo, 'pt-BR')
  )
}

async function carregarTarefasProjeto(projeto) {
  const [tarefas, statuses] = await Promise.all([
    buscarTodasPaginas((params) =>
      tarefaService.getTarefas(projeto.id, { ...params, responsavel: [usuarioId.value] }),
    ),
    buscarTodasPaginas((params) => statusService.getStatuses(projeto.id, params)),
  ])
  const mapaStatus = new Map(statuses.map((status) => [String(status.id), status]))

  const tarefasComDetalhes = await Promise.all(
    tarefas.map(async (tarefa) => {
      if (tarefa.status != null) return tarefa
      try {
        const { data } = await tarefaService.getTarefa(tarefa.id, projeto.id)
        return { ...tarefa, ...data }
      } catch {
        return tarefa
      }
    }),
  )

  return tarefasComDetalhes
    .map((tarefa) => ({
      ...tarefa,
      projetoDetalhe: projeto,
      statusDetalhe:
        tarefa.status && typeof tarefa.status === 'object'
          ? tarefa.status
          : mapaStatus.get(String(idStatus(tarefa))),
    }))
    .filter((tarefa) => !estaConcluida(tarefa, tarefa.statusDetalhe))
}

async function carregarPendencias() {
  const meusProjetos = await buscarTodasPaginas((params) =>
    projetoService.getProjetos({ ...params, meus: 'true' }),
  )
  const mapa = new Map(projetos.value)
  meusProjetos.forEach((projeto) => mapa.set(String(projeto.id), projeto))
  projetos.value = mapa

  const resultados = await Promise.allSettled(meusProjetos.map(carregarTarefasProjeto))
  pendencias.value = resultados
    .filter((resultado) => resultado.status === 'fulfilled')
    .flatMap((resultado) => resultado.value)
    .sort(ordenarPendencias)
}

async function carregarAtividade() {
  carregando.value = true
  erro.value = ''
  try {
    if (!userStore.user) await userStore.getMe()
    const resultados = await Promise.allSettled([carregarPedidos(), carregarPendencias()])
    if (resultados.every((resultado) => resultado.status === 'rejected')) {
      throw resultados[0].reason
    }
    if (resultados.some((resultado) => resultado.status === 'rejected')) {
      erro.value = 'Parte das suas atividades não pôde ser carregada. Tente novamente.'
    }
  } catch {
    erro.value = 'Não foi possível carregar suas atividades.'
  } finally {
    carregando.value = false
  }
}

async function responderConvite(pedido, aceitar) {
  respondendoId.value = pedido.id
  mensagem.value = ''
  erro.value = ''
  try {
    if (aceitar) await pedidoStore.aceitarPedido(pedido.id)
    else await pedidoStore.recusarPedido(pedido.id)
    pedidos.value = pedidos.value.filter((item) => item.id !== pedido.id)
    mensagem.value = aceitar ? 'Convite aceito com sucesso.' : 'Convite recusado.'
    if (aceitar) await carregarPendencias()
  } catch {
    erro.value = 'Não foi possível responder ao convite.'
  } finally {
    respondendoId.value = null
  }
}

async function excluirConvite(pedido) {
  if (!window.confirm(`Excluir o convite do evento “${projetoDoPedido(pedido).nome}”?`)) return

  excluindoId.value = pedido.id
  mensagem.value = ''
  erro.value = ''
  try {
    await pedidoStore.excluirPedido(pedido.id)
    pedidos.value = pedidos.value.filter((item) => item.id !== pedido.id)
    mensagem.value = 'Convite excluído com sucesso.'
  } catch (requestError) {
    erro.value = requestError.response?.data?.detail || 'Não foi possível excluir o convite.'
  } finally {
    excluindoId.value = null
  }
}

function formatarData(valor) {
  if (!valor) return 'Sem prazo'
  const data = /^\d{4}-\d{2}-\d{2}$/.test(valor)
    ? new Date(`${valor}T00:00:00`)
    : new Date(valor)
  return Number.isNaN(data.getTime()) ? 'Sem prazo' : data.toLocaleDateString('pt-BR')
}

function normalizarStatus(nome) {
  return String(nome ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function corStatus(tarefa) {
  const status = tarefa.statusDetalhe
  const nome = normalizarStatus(status?.nome)

  if (status?.finaliza_task || nome.includes('conclu') || nome.includes('finaliz')) {
    return coresPorStatus.get('concluido')
  }
  if (nome.includes('andamento') || nome.includes('progresso') || nome.includes('execucao')) {
    return coresPorStatus.get('em andamento')
  }
  if (nome.includes('pendente') || nome.includes('a fazer') || nome.includes('aguard')) {
    return coresPorStatus.get('pendente')
  }

  if (!coresPorStatus.has(nome)) coresPorStatus.set(nome, status?.cor || '#667085')
  return coresPorStatus.get(nome)
}

function prioridadeDa(tarefa) {
  if (tarefa.atrasada || tarefa.situacao === 'atrasada') {
    return { nome: 'Atrasada', cor: '#d71920', icone: 'mdi-alert-circle-outline' }
  }
  const prioridade = prioridades[tarefa.prioridade] ?? { nome: 'Pendente', cor: '#667085' }
  return { ...prioridade, icone: 'mdi-alert-outline' }
}

onMounted(carregarAtividade)
</script>

<template>
  <section class="atividade" aria-live="polite">
    <div v-if="carregando" class="estado">
      <span class="mdi mdi-loading mdi-spin" aria-hidden="true"></span>
      Carregando suas atividades...
    </div>

    <template v-else>
      <p v-if="erro" class="aviso erro">{{ erro }}</p>
      <p v-if="mensagem" class="aviso sucesso">{{ mensagem }}</p>

      <section class="bloco">
        <h2>Solicitações</h2>

        <div class="grupo">
          <h3>Convites recebidos</h3>
          <div v-if="convitesRecebidos.length" class="carrossel">
            <article v-for="pedido in convitesRecebidos" :key="pedido.id" class="convite-card">
              <div class="imagem-evento">
                <img
                  v-if="imagemDisponivel(projetoDoPedido(pedido))"
                  :src="urlImagem(projetoDoPedido(pedido))"
                  :alt="`Imagem do evento ${projetoDoPedido(pedido).nome}`"
                  @error="registrarErroImagem(projetoDoPedido(pedido))"
                />
                <span v-else class="mdi mdi-image-outline" aria-hidden="true"></span>
              </div>
              <div class="convite-conteudo">
                <strong>{{ projetoDoPedido(pedido).nome }}</strong>
                <div class="acoes-convite">
                  <button
                    type="button"
                    class="botao aceitar"
                    :disabled="respondendoId === pedido.id"
                    @click="responderConvite(pedido, true)"
                  >
                    <span class="mdi mdi-check" aria-hidden="true"></span> Aceitar
                  </button>
                  <button
                    type="button"
                    class="botao recusar"
                    :disabled="respondendoId === pedido.id"
                    @click="responderConvite(pedido, false)"
                  >
                    <span class="mdi mdi-close" aria-hidden="true"></span> Recusar
                  </button>
                </div>
              </div>
            </article>
          </div>
          <p v-else class="vazio">Você não tem convites aguardando resposta.</p>
        </div>

        <div class="grupo">
          <h3>Enviados e pendentes</h3>
          <div v-if="convitesEnviadosPendentes.length" class="carrossel">
            <article v-for="pedido in convitesEnviadosPendentes" :key="pedido.id" class="convite-card">
              <div class="imagem-evento">
                <img
                  v-if="imagemDisponivel(projetoDoPedido(pedido))"
                  :src="urlImagem(projetoDoPedido(pedido))"
                  :alt="`Imagem do evento ${projetoDoPedido(pedido).nome}`"
                  @error="registrarErroImagem(projetoDoPedido(pedido))"
                />
                <span v-else class="mdi mdi-image-outline" aria-hidden="true"></span>
              </div>
              <div class="convite-conteudo">
                <strong>{{ projetoDoPedido(pedido).nome }}</strong>
                <span class="status-convite pendente">Aguardando resposta</span>
                <button
                  type="button"
                  class="botao excluir"
                  :disabled="excluindoId === pedido.id"
                  @click="excluirConvite(pedido)"
                >
                  <span class="mdi mdi-trash-can-outline" aria-hidden="true"></span>
                  {{ excluindoId === pedido.id ? 'Excluindo...' : 'Excluir convite' }}
                </button>
              </div>
            </article>
          </div>
          <p v-else class="vazio">Nenhum convite enviado está pendente.</p>
        </div>

        <div class="grupo">
          <h3>Enviados e recusados</h3>
          <div v-if="convitesEnviadosRecusados.length" class="carrossel">
            <article v-for="pedido in convitesEnviadosRecusados" :key="pedido.id" class="convite-card">
              <div class="imagem-evento">
                <img
                  v-if="imagemDisponivel(projetoDoPedido(pedido))"
                  :src="urlImagem(projetoDoPedido(pedido))"
                  :alt="`Imagem do evento ${projetoDoPedido(pedido).nome}`"
                  @error="registrarErroImagem(projetoDoPedido(pedido))"
                />
                <span v-else class="mdi mdi-image-outline" aria-hidden="true"></span>
              </div>
              <div class="convite-conteudo">
                <strong>{{ projetoDoPedido(pedido).nome }}</strong>
                <span class="status-convite recusado">Convite recusado</span>
              </div>
            </article>
          </div>
          <p v-else class="vazio">Nenhum convite enviado foi recusado.</p>
        </div>
      </section>

      <section class="bloco pendencias-bloco">
        <h2>Pendências</h2>
        <div v-if="pendencias.length" class="carrossel">
          <article v-for="tarefa in pendencias" :key="`${tarefa.projetoDetalhe.id}-${tarefa.id}`" class="tarefa-card">
            <div class="imagem-evento">
              <img
                v-if="imagemDisponivel(tarefa.projetoDetalhe)"
                :src="urlImagem(tarefa.projetoDetalhe)"
                :alt="`Imagem do evento ${tarefa.projetoDetalhe.nome}`"
                @error="registrarErroImagem(tarefa.projetoDetalhe)"
              />
              <span v-else class="mdi mdi-image-outline" aria-hidden="true"></span>
            </div>
            <div class="tarefa-conteudo">
              <strong>{{ tarefa.titulo }}</strong>
              <span class="datas">
                <span class="mdi mdi-calendar-blank-outline" aria-hidden="true"></span>
                {{ formatarData(tarefa.criado_em) }} a {{ formatarData(tarefa.prazo) }}
              </span>
              <div class="etiquetas">
                <span
                  class="prioridade"
                  :style="{ backgroundColor: prioridadeDa(tarefa).cor }"
                >
                  <span :class="['mdi', prioridadeDa(tarefa).icone]" aria-hidden="true"></span>
                  {{ prioridadeDa(tarefa).nome }}
                </span>
                <span
                  v-if="tarefa.statusDetalhe?.nome"
                  class="status-tarefa"
                  :style="{ backgroundColor: corStatus(tarefa) }"
                >
                  {{ tarefa.statusDetalhe.nome }}
                </span>
              </div>
              <RouterLink
                class="ver-mais"
                :to="{ name: 'detailsEventsView', params: { id: tarefa.projetoDetalhe.id } }"
              >
                Ver evento <span class="mdi mdi-arrow-right" aria-hidden="true"></span>
              </RouterLink>
            </div>
          </article>
        </div>
        <p v-else class="vazio">Você não possui tarefas pendentes.</p>
      </section>
    </template>
  </section>
</template>

<style scoped>
.atividade {
  --azul: var(--primaria, #01295f);
  min-width: 0;
  color: #111;
}

.bloco + .bloco {
  margin-top: 3rem;
}

.bloco h2 {
  margin: 0 0 1rem;
  color: var(--azul);
  font-size: 1.65rem;
}

.grupo + .grupo {
  margin-top: 2rem;
}

.grupo h3 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
}

.carrossel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
}

.convite-card,
.tarefa-card {
  min-width: 0;
  overflow: hidden;
  border-radius: 5px;
  background: #fff;
  box-shadow: 0 6px 18px rgb(0 0 0 / 16%);
}

.imagem-evento {
  display: grid;
  width: 100%;
  height: 120px;
  place-items: center;
  overflow: hidden;
  background: #d9d9d9;
  color: #7a8491;
}

.imagem-evento img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.imagem-evento .mdi {
  font-size: 2.5rem;
}

.convite-conteudo,
.tarefa-conteudo {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 0.75rem;
}

.convite-conteudo > strong,
.tarefa-conteudo > strong {
  overflow: hidden;
  color: #111;
  font-size: 1rem;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.acoes-convite {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.botao,
.ver-mais {
  display: flex;
  min-height: 34px;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  border: 1px solid;
  border-radius: 4px;
  background: #fff;
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
}

.botao:disabled {
  cursor: wait;
  opacity: 0.55;
}

.aceitar {
  border-color: #16803c;
  color: #16803c;
}

.recusar {
  border-color: #e11d2e;
  color: #e11d2e;
}

.excluir {
  width: 100%;
  border-color: #e11d2e;
  color: #e11d2e;
}

.status-convite {
  align-self: center;
  padding: 0.22rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.status-convite.pendente {
  background: #fff0c2;
  color: #784f00;
}

.status-convite.recusado {
  background: #fde7e9;
  color: #b4232d;
}

.datas {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #747474;
  font-size: 0.72rem;
}

.etiquetas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.prioridade,
.status-tarefa {
  display: inline-flex;
  min-height: 20px;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  padding: 0.12rem 0.55rem;
  border-radius: 999px;
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.2;
}

.ver-mais {
  border-color: #1760b2;
  color: var(--azul);
  text-decoration: none;
}

.vazio {
  margin: 0;
  padding: 0.5rem 0;
  color: #667085;
  font-size: 0.9rem;
  text-align: left;
}

.estado {
  display: flex;
  min-height: 220px;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  color: var(--azul);
}

.estado .mdi {
  font-size: 1.5rem;
}

.aviso {
  margin: 0 0 1rem;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.aviso.erro {
  background: #fde7e9;
  color: #9c1823;
}

.aviso.sucesso {
  background: #e8f6ec;
  color: #126b32;
}

@media (max-width: 1100px) {
  .carrossel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .bloco + .bloco {
    margin-top: 2.25rem;
  }

  .bloco h2 {
    font-size: 1.4rem;
  }

  .grupo + .grupo {
    margin-top: 1.5rem;
  }

  .carrossel {
    display: flex;
    margin-inline: -1rem;
    padding: 0.25rem 1rem 1rem;
    gap: 1rem;
    overflow-x: auto;
    scroll-padding-inline: 1rem;
    scroll-snap-type: x mandatory;
  }

  .convite-card,
  .tarefa-card {
    width: min(78vw, 280px);
    flex: 0 0 min(78vw, 280px);
    scroll-snap-align: start;
  }

  .imagem-evento {
    height: 112px;
  }
}

button:focus-visible,
a:focus-visible {
  outline: 3px solid #2767aa;
  outline-offset: 2px;
}
</style>