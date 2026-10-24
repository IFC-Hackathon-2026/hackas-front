
<script setup>
import { notificacao } from '@/services/notificacaoService'
import { computed, onScopeDispose, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProjetoStore } from '@/stores/projetoStore'
import { useTarefaStore } from '@/stores/tarefaStore'
import { useStatusStore } from '@/stores/statusStore'
import api from '@/api/config'

const route = useRoute()
const projetoStore = useProjetoStore()
const tarefaStore = useTarefaStore()
const statusStore = useStatusStore()

const equipeId = computed(() => String(route.params.id ?? route.query.id ?? ''))

const equipe = ref(null)
const tarefas = ref([])
const statuses = ref([])
const carregando = ref(false)
const erro = ref('')
const fotosComErro = ref(new Set())
const agora = ref(Date.now())

let consulta = 0

const idDe = (valor) =>
  valor !== null && typeof valor === 'object' ? valor.id : valor

const statusFinal = computed(() =>
  new Set(
    statuses.value
      .filter((status) => status.finaliza_task === true)
      .map((status) => String(status.id))
  )
)

const concluida = (tarefa) =>
  Boolean(tarefa.concluido_em) ||
  tarefa.situacao === 'concluida' ||
  statusFinal.value.has(String(idDe(tarefa.status)))

const atrasada = (tarefa) =>
  !concluida(tarefa) &&
  Boolean(tarefa.prazo) &&
  new Date(tarefa.prazo).getTime() < agora.value

const pendente = (tarefa) =>
  !concluida(tarefa) && !atrasada(tarefa)

const concluidas = computed(() =>
  tarefas.value.filter(concluida).length
)

const atrasadas = computed(() =>
  tarefas.value.filter(atrasada).length
)

const progresso = computed(() =>
  tarefas.value.length
    ? Math.round((concluidas.value / tarefas.value.length) * 100)
    : 0
)

const participantes = computed(() =>
  [...(equipe.value?.participacoes ?? [])]
    .sort(
      (a, b) =>
        ({ fundador: 0, organizador: 1 }[a.cargo] ?? 2) -
        ({ fundador: 0, organizador: 1 }[b.cargo] ?? 2)
    )
    .map((participacao) => {
      const usuarioId = String(idDe(participacao.usuario))

      const minhas = tarefas.value.filter((tarefa) => {
        const responsaveis = tarefa.responsavel ?? []

        const lista = Array.isArray(responsaveis)
          ? responsaveis
          : [responsaveis]

        return lista.some(
          (responsavel) =>
            String(idDe(responsavel)) === usuarioId
        )
      })

      return {
        ...participacao,
        total: minhas.length,
        concluidas: minhas.filter(concluida).length,
        atrasadas: minhas.filter(atrasada).length,
        pendentes: minhas.filter(pendente).length,
      }
    })
)

function fotoUrl(usuario) {
  return usuario?.foto?.url
    ? new URL(
        usuario.foto.url,
        new URL(api.defaults.baseURL, window.location.origin)
      ).href
    : ''
}

async function carregar() {
  const atual = ++consulta
  const id = equipeId.value

  equipe.value = null
  tarefas.value = []
  statuses.value = []
  fotosComErro.value = new Set()
  erro.value = ''
  carregando.value = Boolean(id)

  if (!id) return

  try {
    const resultados = await Promise.allSettled([
      projetoStore.selecionarProjeto(id),
      statusStore.getStatuses(id),
      (async () => {
        const todas = []
        let params = { page_size: 100 }

        do {
          const pagina = await tarefaStore.getTarefas(id, params)

          if (atual !== consulta) return []

          todas.push(...pagina)

          params = tarefaStore.next
            ? Object.fromEntries(
                new URL(
                  tarefaStore.next,
                  window.location.origin
                ).searchParams
              )
            : null
        } while (params)

        return todas
      })(),
    ])

    if (atual !== consulta) return

    const falha = resultados.find(
      (resultado) => resultado.status === 'rejected'
    )

    if (falha) throw falha.reason

    const listaTarefas = resultados[2].value

    const detalhes = await Promise.all(
      listaTarefas.map((tarefa) =>
        tarefaStore.getTarefa(tarefa.id, id)
      )
    )

    if (atual !== consulta) return

    equipe.value = resultados[0].value
    statuses.value = resultados[1].value
    tarefas.value = detalhes
    agora.value = Date.now()
  } catch (error) {
    if (atual === consulta) {
      erro.value =
        error.response?.data?.detail ||
        'Não foi possível carregar o dashboard desta equipe.'
      notificacao.erro(erro.value)
    }
  } finally {
    if (atual === consulta) {
      carregando.value = false
    }
  }
}

watch(equipeId, carregar, { immediate: true })

onScopeDispose(() => {
  consulta++
})
</script>

<template>
  <section class="dashboard" aria-label="Dashboard do evento">

    <p v-if="!equipeId">
      Abra o dashboard pelo ID da equipe.
    </p>

    <p v-else-if="carregando" role="status">
      Carregando dashboard...
    </p>

    <div v-else-if="erro" role="alert">
      <p>{{ erro }}</p>
      <button type="button" @click="carregar">
        Tentar novamente
      </button>
    </div>

    <template v-else-if="equipe">
      <div class="summary">
        <div>
          <span>Progresso</span>
          <strong>{{ progresso }}%</strong>
        </div>
        <div>
          <span>Atrasadas</span>
          <strong class="overdue">{{ atrasadas }}</strong>
        </div>
        <div>
          <span>Concluídas</span>
          <strong>{{ concluidas }}</strong>
        </div>
      </div>

      <div class="progress-section">
        <div class="progress-heading">
          <h2>Situação do evento</h2>
        </div>

        <progress
          :value="progresso"
          max="100"
          aria-label="Progresso das tarefas da equipe"
        >
          {{ progresso }}%
        </progress>

      </div>

      <ul v-if="participantes.length" class="members">
        <li
          v-for="participante in participantes"
          :key="participante.id"
          class="member"
        >
          <img
            v-if="
              fotoUrl(participante.usuario) &&
              !fotosComErro.has(participante.id)
            "
            :src="fotoUrl(participante.usuario)"
            class="avatar"
            alt=""
            @error="fotosComErro.add(participante.id)"
          />

          <span
            v-else
            class="avatar placeholder"
            aria-hidden="true"
          ></span>

          <div class="member-info">
            <h2>
              {{ participante.usuario?.name || 'Participante' }}

              <span
                v-if="
                  ['fundador', 'organizador'].includes(
                    participante.cargo
                  )
                "
                class="mdi mdi-crown crown"
                :title="participante.cargo"
                aria-hidden="true"
              ></span>
            </h2>

            <p class="member-stats">
              <span>Atrasadas: <span class="overdue">{{ participante.atrasadas }}</span></span>
              <span>Concluídas: {{ participante.concluidas }}</span>
            </p>
          </div>
        </li>
      </ul>

      <p v-else>
        Nenhum participante nesta equipe.
      </p>
    </template>
  </section>
</template>

<style scoped>
.dashboard {
  width: 100%;
  max-width: 100%;
  margin: 56px auto 64px;
  color: var(--texto);
}

h1 {
  font-size: 23px;
  margin-bottom: 32px;
}

h1 span {
  font-size: 18px;
  font-weight: 500;
}

.summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 48px;
}

.summary > div {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
}

.summary strong {
  font-size: 32px;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.summary span {
  font-size: 18px;
  color: var(--texto);
}

.overdue {
  color: #e52323;
}

.progress-section {
  margin-bottom: 64px;
}

.progress-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.progress-heading h2 {
  font-size: 18px;
  font-weight: 500;
  color: var(--texto);
}

progress {
  display: block;
  appearance: none;
  width: 100%;
  height: 20px;
  overflow: hidden;
  border: 0;
  border-radius: 20px;
  background: #d9d9d9;
}

progress::-webkit-progress-bar {
  background: #d9d9d9;
  border-radius: 20px;
}

progress::-webkit-progress-value {
  background: var(--primaria);
  border-radius: 20px;
}

progress::-moz-progress-bar {
  background: var(--primaria);
  border-radius: 20px;
}

.progress-section > p {
  margin-top: 10px;
  font-size: 13px;
  color: #4f5560;
}

.members {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 54px 100px;
}

.member {
  display: flex;
  align-items: center;
  gap: 24px;
  min-width: 0;
}

.avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.placeholder {
  background: #d9d9d9;
}

.member-info {
  min-width: 0;
}

.member-info h2 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 17px;
  color: #171717;
}

.member-info p {
  margin-top: 6px;
  font-size: 13px;
}

.crown {
  color: #ffb800;
  font-size: 24px;
}

button {
  margin-top: 12px;
  padding: 8px 16px;
  cursor: pointer;
}

@media (max-width: 700px) {
  .summary { gap: 12px; }
  .summary span { font-size: 14px; }

  .members {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .dashboard {
    margin-top: 28px;
  }
}
.member-stats { display: flex; flex-wrap: wrap; gap: 8px 24px; }
.member-stats > span + span { border-left: 1px solid #808080; padding-left: 24px; }

@media (min-width: 701px) and (max-width: 1100px) {
  .members { gap: 2rem; }
  .member { gap: 1rem; }
  .avatar { width: 64px; height: 64px; }
}
@media (max-width: 480px) {
  .summary { grid-template-columns: minmax(0, 1fr); gap: 1.25rem; margin-bottom: 2rem; }
  .summary > div { flex-direction: row; justify-content: space-between; gap: 1rem; text-align: left; }
  .summary strong { font-size: 1.5rem; }
  .member { align-items: flex-start; gap: 0.75rem; }
  .avatar { width: 48px; height: 48px; }
  .member-info h2 { flex-wrap: wrap; font-size: 1rem; }
  .member-info p { overflow-wrap: anywhere; }
  .member-stats { flex-direction: column; gap: 0.5rem; }
  .member-stats > span + span { border-left: 0; padding-left: 0; }
  .progress-heading { flex-wrap: wrap; gap: 0.5rem; }
}

</style>
