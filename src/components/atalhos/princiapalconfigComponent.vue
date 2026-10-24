<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ParticipantesComponent from './participantesComponent.vue'
import SolicitacoesComponent from './solicitacaoesComponent.vue'
import { useProjetoStore } from '@/stores/projetoStore'


const projetoStore = useProjetoStore()
const carregando = ref(false)
const erro = ref('')
const excluindo = ref(false)
const erroExclusao = ref('')
const router = useRouter()

const abas = ref('participantes')
const route = useRoute()
const equipeId = computed(() => String(route.params.id ?? route.query.id ?? ''))
const podeVerConfiguracoes = computed(() => equipeId.value &&
  String(projetoStore.projetoAtual?.id) === equipeId.value && projetoStore.podeConfigurar)
watch(equipeId, async (id, anterior, onCleanup) => {
  let ativa = true
  onCleanup(() => { ativa = false })
  erro.value = ''
  carregando.value = Boolean(id)
  if (!id) return
  try {
    await projetoStore.selecionarProjeto(id)
  } catch {
    if (ativa) erro.value = 'Não foi possível verificar sua permissão nesta equipe.'
  } finally {
    if (ativa) carregando.value = false
  }
}, { immediate: true })
watch(() => route.fullPath, () => {
  abas.value = 'participantes'
  erroExclusao.value = ''
})

async function excluirEquipe() {
  if (excluindo.value || !podeVerConfiguracoes.value || !projetoStore.podeExcluir) return
  const equipe = projetoStore.projetoAtual
  if (!window.confirm(`Excluir a equipe “${equipe.nome}”? Esta ação não pode ser desfeita.`)) return
  excluindo.value = true
  erroExclusao.value = ''
  try {
    await projetoStore.deleteProjeto(equipe.id)
  } catch (error) {
    if (equipeId.value === String(equipe.id)) {
      erroExclusao.value = error.response?.data?.detail || 'Não foi possível excluir a equipe. Tente novamente.'
    }
    return
  } finally {
    excluindo.value = false
  }
  if (equipeId.value === String(equipe.id)) await router.replace({ name: 'home' })
}


</script>

<template>

  <p v-if="carregando" role="status">Verificando permissão da equipe...</p>
  <p v-else-if="erro" role="alert">{{ erro }}</p>
  <p v-else-if="!equipeId" role="status">Selecione uma equipe para acessar suas configurações.</p>
  <p v-else-if="!podeVerConfiguracoes" role="status">As configurações estão disponíveis apenas para o fundador e os organizadores desta equipe.</p>
  <div v-else class="config">
    <aside class="sidebar">
      <nav class="abas">
        <button
          type="button"
          class="aba"
          :class="{ ativa: abas === 'participantes' }"
          @click="abas = 'participantes'"
        >
          <span class="mdi mdi-account-group"></span>
          Participantes
        </button>

        <button
          type="button"
          class="aba"
          :class="{ ativa: abas === 'solicitacoes' }"
          @click="abas = 'solicitacoes'"
        >
          <span class="mdi mdi-account-plus-outline"></span>
          Solicitações
        </button>
      </nav>

      <button v-if="projetoStore.podeExcluir" type="button" class="excluir" :disabled="excluindo" @click="excluirEquipe">
        <span class="mdi mdi-trash-can-outline"></span>
        {{ excluindo ? 'Excluindo...' : 'Excluir equipe' }}
      </button>
    </aside>

    <div class="conteudo">
      <p v-if="erroExclusao" class="erro-exclusao" role="alert">{{ erroExclusao }}</p>
      <ParticipantesComponent v-if="abas === 'participantes'" />
      <SolicitacoesComponent v-else />
    </div>
  </div>
</template>

<style scoped>
.erro-exclusao {
  margin-bottom: 20px;
  color: #a12424;
}
.excluir:disabled {
  opacity: 0.5;
  cursor: default;
}
.config {
  --azul: var(--primaria, #01295f);

  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 100%;
  margin: 64px auto 40px;
  padding: 0;
  color: var(--azul);
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.abas {
  display: flex;
  gap: 1rem;
}

.aba {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.25rem;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--azul);
  font-size: 1.15rem;
  font-weight: 700;
  cursor: pointer;
}

.aba .mdi {
  font-size: 1.7rem;
}

.aba.ativa {
  border-bottom-color: var(--azul);
}

.excluir {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.25rem;
  border: 0;
  background: transparent;
  color: var(--azul);
  font-weight: 700;
  cursor: pointer;
}

.excluir .mdi {
  font-size: 1.9rem;
}

.conteudo {
  flex: 1;
  min-width: 0;
}

@media (min-width: 950px) {
  .config {
  flex-direction: row;
  gap: 0;
  min-height: 400px;
}

  .sidebar {
  width: 260px;
  position: relative;
  top: auto;
  height: auto;
  min-height: 400px;
  align-self: stretch;
  padding-bottom: 24px;
  flex-shrink: 0;
  justify-content: space-between;
  padding-right: 1.5rem;
  border-right: 1px solid #dedede;
}
  .abas {
    flex-direction: column;
    gap: 0.5rem;
  }

  .aba {
    width: 100%;
  }

  .conteudo {
    padding: 0 0 40px clamp(24px, 4vw, 70px);
  }
}

.aba { font-size: 1.1rem; }
.excluir { margin-top: auto; white-space: nowrap; }
@media (max-width: 949px) {
  .config { margin-top: 24px; }
  .sidebar { padding-bottom: 20px; border-bottom: 1px solid #dedede; }
  .abas { flex-wrap: wrap; }
  .excluir { font-size: 1rem; } 
}
</style>
