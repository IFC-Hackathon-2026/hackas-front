<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api/config'
import UserService from '@/services/userService'
import { useProjetoStore } from '@/stores/projetoStore'

const projetoStore = useProjetoStore()
const userService = new UserService()
const route = useRoute()
const emit = defineEmits(['equipe-carregada'])
const equipeId = computed(() => String(route.params.id ?? route.query.id ?? ''))
const menuAberto = ref(null)
const fotosComErro = ref(new Set())
function fotoUrl(usuario) {
  if (!usuario?.foto?.url) return ''
  return new URL(usuario.foto.url, new URL(api.defaults.baseURL, window.location.origin)).href
}
const equipe = ref(null)
const loadingMembers = ref(false)
const error = ref('')
const memberWarning = ref('')
const actionPending = ref(false)
const actionMessage = ref('')
const equipeAtualSelecionada = computed(() =>
  String(projetoStore.projetoAtual?.id) === equipeId.value,
)
const podeGerenciar = computed(() => equipeAtualSelecionada.value && projetoStore.podeExcluir)
function podeRemover(participacao) {
  if (!equipeAtualSelecionada.value || participacao.id == null || participacao.cargo === 'fundador') return false
  return podeGerenciar.value || (
    projetoStore.meuCargo === 'organizador' && participacao.cargo === 'membro'
  )
}
function podeAlterarCargo(participacao) {
  if (!equipeAtualSelecionada.value || participacao.id == null || participacao.cargo === 'fundador') return false
  return podeGerenciar.value || (
    projetoStore.meuCargo === 'organizador' && participacao.cargo === 'membro'
  )
}
let requestId = 0
const prioridadeCargo = { fundador: 0, organizador: 1 }
const participantes = computed(() => {
  const lista = [...(equipe.value?.participacoes ?? [])]
  const criador = equipe.value?.criador
  // O criador pode ser retornado separadamente, sem uma participação na lista.
  if (criador?.id != null && !lista.some(({ usuario }) => String(usuario?.id) === String(criador.id))) {
    lista.unshift({ usuario: criador, cargo: 'fundador' })
  }
  return lista.sort(
    (a, b) => (prioridadeCargo[a.cargo] ?? 2) - (prioridadeCargo[b.cargo] ?? 2),
  )
})
function chaveParticipacao(participacao) {
  return participacao.id != null ? `participacao-${participacao.id}` : `usuario-${participacao.usuario?.id}`
}
const cargos = { fundador: 'Fundador', organizador: 'Organizador', membro: 'Membro', participante: 'Participante' }

async function gerenciarParticipante(participacao, remover = false) {
  if (actionPending.value || participacao.id == null || participacao.cargo === 'fundador') return
  if (remover ? !podeRemover(participacao) : !podeAlterarCargo(participacao)) return
  const nome = participacao.usuario?.name || participacao.usuario?.email || 'este participante'
  if (remover && !window.confirm(`Remover ${nome} da equipe?`)) return
  menuAberto.value = null
  const cargo = participacao.cargo === 'organizador' ? 'membro' : 'organizador'
  const idEquipeDaAcao = equipeId.value
  actionPending.value = true
  actionMessage.value = ''
  error.value = ''
  try {
    if (remover) {
      await projetoStore.deleteParticipante(participacao.id)
    } else {
      await projetoStore.updateParticipante(participacao.id, cargo)
    }
    if (equipeId.value !== idEquipeDaAcao) return
    await carregarParticipantes()
    actionMessage.value = remover ? 'Participante removido da equipe.' : 'Cargo atualizado.'
  } catch (requestError) {
    if (equipeId.value !== idEquipeDaAcao) return
    error.value = requestError.response?.data?.detail || requestError.message || 'Não foi possível concluir a alteração.'
  } finally {
    actionPending.value = false
  }
}

async function carregarParticipantes() {
  const currentRequest = ++requestId
  equipe.value = null
  emit('equipe-carregada', null)
  menuAberto.value = null
  fotosComErro.value = new Set()
  error.value = ''
  memberWarning.value = ''
  actionMessage.value = ''
  loadingMembers.value = Boolean(equipeId.value)
  if (!equipeId.value) return
  try {
    const data = equipeAtualSelecionada.value
      ? await projetoStore.getProjeto(equipeId.value)
      : await projetoStore.selecionarProjeto(equipeId.value)
    if (currentRequest !== requestId) return
    // Assim como no playground, consulta /usuarios/{id}/ para obter o perfil completo.
    const incompletos = (data.participacoes ?? []).filter(({ usuario }) =>
      usuario && (typeof usuario !== 'object' || !usuario.email),
    )
    const ids = [...new Set(incompletos.map(({ usuario }) =>
      typeof usuario === 'object' ? usuario.id : usuario,
    ).filter((id) => id != null))]
    const results = await Promise.allSettled(ids.map((id) => userService.getUser(id)))
    if (currentRequest !== requestId) return
    const usuarios = new Map()
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') usuarios.set(String(ids[index]), result.value.data)
    })
    const criador = data.criador
    if (criador?.id != null && !criador.email && !usuarios.has(String(criador.id))) {
      try {
        const { data: usuario } = await userService.getUser(criador.id)
        usuarios.set(String(criador.id), usuario)
      } catch {
        // Preserva o criador mesmo quando a consulta do perfil não está disponível.
      }
    }
    if (currentRequest !== requestId) return
    equipe.value = {
      ...data,
      criador: criador ? { ...criador, ...usuarios.get(String(criador.id)) } : null,
      participacoes: (data.participacoes ?? []).map((participacao) => {
        const usuario = participacao.usuario
        const id = typeof usuario === 'object' ? usuario?.id : usuario
        return {
          ...participacao,
          usuario: {
            ...(typeof usuario === 'object' ? usuario : { id }),
            ...usuarios.get(String(id)),
          },
        }
      }),
    }
    emit('equipe-carregada', equipe.value)
    if (equipe.value.participacoes.some(({ usuario }) => !usuario.email)) {
      memberWarning.value = 'A API não disponibilizou o e-mail de alguns participantes.'
    }
  } catch {
    if (currentRequest === requestId) error.value = 'Não foi possível carregar os participantes.'
  } finally {
    if (currentRequest === requestId) loadingMembers.value = false
  }
}

watch(equipeId, carregarParticipantes, { immediate: true })
</script>

<template>
  <section class="participants" aria-label="Participantes da equipe" @keydown.esc="menuAberto = null">
    <p v-if="!equipeId" class="notice">Abra as configurações pelo ID da equipe para ver os participantes.</p>
    <p v-else-if="loadingMembers" role="status">Carregando participantes...</p>
    <template v-else-if="equipe">

      <h1 class="team-title">{{ equipe.nome }}</h1>
      <p v-if="memberWarning" class="notice" role="status">{{ memberWarning }}</p>


      <ul v-if="participantes.length" class="members-grid">

        <li v-for="(participacao, index) in participantes" :key="chaveParticipacao(participacao)" class="member">
          <img v-if="fotoUrl(participacao.usuario) && !fotosComErro.has(index)"
            :src="fotoUrl(participacao.usuario)" alt="" class="avatar" @error="fotosComErro.add(index)" />
          <span v-else class="avatar placeholder" aria-hidden="true"></span>
          <div class="member-info">
            <h2>{{ participacao.usuario?.name || 'Nome não informado' }}</h2>
            <p>{{ participacao.usuario?.email || 'E-mail não informado' }}</p>
            <span class="member-role">{{ cargos[participacao.cargo] ?? participacao.cargo }}</span>
          </div>
          <span v-if="['fundador', 'organizador'].includes(participacao.cargo)" class="mdi mdi-crown crown" :title="cargos[participacao.cargo]" aria-hidden="true"></span>
          <div v-if="podeGerenciar || podeRemover(participacao) || podeAlterarCargo(participacao)" class="member-actions">

            <button type="button" class="more" :aria-label="'Ações para ' + (participacao.usuario?.name || 'participante')"
              :aria-expanded="menuAberto === chaveParticipacao(participacao)" :disabled="actionPending"
              @click="menuAberto = menuAberto === chaveParticipacao(participacao) ? null : chaveParticipacao(participacao)">
              <span class="mdi mdi-dots-vertical" aria-hidden="true"></span>
            </button>

            <template v-if="menuAberto === chaveParticipacao(participacao)">
              <button class="menu-backdrop" type="button" aria-label="Fechar ações" @click="menuAberto = null"></button>
              <div class="action-menu">
                <p v-if="participacao.cargo === 'fundador'" class="protected-note">O fundador não pode ser removido ou ter o cargo alterado.</p>
                <p v-else-if="participacao.id == null" class="protected-note">A API não retornou o identificador desta participação.</p>
                <template v-else>
                <button v-if="podeAlterarCargo(participacao)" type="button" :disabled="actionPending" @click="gerenciarParticipante(participacao)">
                  <span :class="['mdi', participacao.cargo === 'organizador' ? 'mdi-crown-outline' : 'mdi-crown']" aria-hidden="true"></span>
                  {{ participacao.cargo === 'organizador' ? 'Retirar de organizador' : 'Promover a organizador' }}
                </button>
                <button v-if="podeRemover(participacao)" type="button" :disabled="actionPending" @click="gerenciarParticipante(participacao, true)">
                  <span class="mdi mdi-account-remove" aria-hidden="true"></span>Remover da equipe
                </button>
                </template>
              </div>
            </template>

          </div>
        </li>
      </ul>
      <p v-else>Esta equipe ainda não tem participantes.</p>
    </template>
    <p v-if="actionMessage" role="status">{{ actionMessage }}</p>
    <div v-if="error" role="alert" class="error">
      <p>{{ error }}</p>
      <button type="button" @click="carregarParticipantes">Tentar novamente</button>
    </div>
  </section>
</template>

<style scoped>
.participants 
{ color: var(--primaria); }

.team-title { 
  margin-bottom: 28px; 
  font-size: 20px; 
  font-weight: 600; 
}
.notice { 
  margin-bottom: 20px; 
  font-size: 13px; 
}
.protected-note {
  padding: 10px 0;
  font-size: 12px;
}
.members-grid 
{ display: grid;
   grid-template-columns: 
   repeat(2, minmax(0, 1fr)); 
   gap: 56px 48px; 
  }
.member { 
  display: flex; 
  align-items: center; 
  gap: 16px; 
  min-width: 0; 
  position: relative; 
}
.avatar { 
  width: 88px; 
  height: 88px; 
  flex-shrink: 0; 
  border-radius: 50%; 
  object-fit: cover; 
}
.placeholder {
   background: #d9d9d9; 
  }
.member-info { 
  flex: 1; 
  min-width: 0; 
}
h2 { 
  color: #171717; 
  font-size: 15px; 
  font-weight: 600; 
}
.member-info p { 
  color: #4f5560; 
  font-size: 12px; 
  overflow-wrap: anywhere; 
}
.member-role { 
  font-size: 11px; 
}
.crown { 
  color: #ffb800; 
  font-size: 23px; 
}
.member-actions { 
  position: relative; 
  flex-shrink: 0; 
}
button { 
  cursor: pointer; 
  font: inherit; 
}
.more { 
  border: 0; 
  background: transparent; 
  color: var(--primaria); 
  padding: 4px; 
  font-size: 25px;
   line-height: 1; 
  }
.menu-backdrop { 
  position: fixed; 
  inset: 0; 
  z-index: 110; 
  background: transparent; 
  border: 0; 
  cursor: default; 
}
.action-menu 
{ position: absolute;
   right: 0; 
   top: 32px; 
   z-index: 111;
    width: 180px; 
    padding: 4px 10px; 
    border: 1px solid #9cb3d0;
     border-radius: 6px; 
    background: #fff; 
    box-shadow: 0 4px 14px rgb(0 18 40 / 12%);
   }
.action-menu button {
   display: flex; 
   align-items: center; 
   gap: 9px; 
   width: 100%; 
   padding: 10px 0; 
   border: 0;
    background: #fff; 
    color: var(--primaria); 
    text-align: left; 
    font-size: 11px; 
    line-height: 1.4; 
  }
.action-menu button + button { 
  border-top: 1px solid #9cb3d0;
 }
.action-menu .mdi { 
  font-size: 19px;
 }
.action-menu button:hover {
   background: #f0f4fa; 
  }
.error { 
  margin-top: 24px; 
  color: #a12424;
 }
button:disabled { 
  opacity: .5; 
  cursor: default; 
}
button:focus-visible { 
  outline: 2px solid #2767aa; 
  outline-offset: 3px; 
}
@media (max-width: 1150px) { 
  .members-grid { gap: 36px 24px; } 
  .avatar { width: 64px; height: 64px; } 
  .member { gap: 10px; } 
}

@media (max-width: 700px) {
   .team-title { margin-bottom: 20px; font-size: 1.125rem; }
   .members-grid { grid-template-columns: minmax(0, 1fr); gap: 20px; }
   .avatar { width: 52px; height: 52px; }
   .member { gap: 10px; }
   .more { display: grid; place-items: center; width: 44px; height: 44px; }
   .action-menu { top: 44px; width: min(180px, 70vw); }
   }
</style>
