<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import AppButton from '@/components/forms/AppButton.vue'
import { useProjetoStore } from '@/stores/projetoStore'
import { useUserStore } from '@/stores/userStore'
import { usePedidoParticipacaoStore } from '@/stores/pedidoParticipacaoStore'
import { apiErrorMessage } from '@/utils/apiErrorMessage'

const emit = defineEmits(['enviado'])
const route = useRoute()
const toast = useToast()
const projetoStore = useProjetoStore()
const userStore = useUserStore()
const pedidoStore = usePedidoParticipacaoStore()
const aberto = ref(false)
const carregando = ref(false)
const enviando = ref(false)
const erro = ref('')
const busca = ref('')
const mostrarResultados = ref(false)
const usuarioId = ref('')
const usuarios = ref([])
const convidados = ref(new Set())
const equipeId = computed(() => String(route.params.id ?? route.query.id ?? ''))
const permitido = computed(() => equipeId.value && String(projetoStore.projetoAtual?.id) === equipeId.value && projetoStore.podeConfigurar)
const idDe = (valor) => valor && typeof valor === 'object' ? valor.id : valor
const membros = computed(() => new Set([
  idDe(projetoStore.projetoAtual?.criador),
  userStore.user?.id,
  ...(projetoStore.projetoAtual?.participacoes ?? []).map((item) => idDe(item.usuario)),
].filter((id) => id != null).map(String)))
const disponiveis = computed(() => usuarios.value.filter((usuario) =>
  !membros.value.has(String(usuario.id)) && !convidados.value.has(String(usuario.id)) &&
  !pedidoStore.temPedidoPendente(equipeId.value, usuario.id),
))
const filtrados = computed(() => {
  const termo = busca.value.trim().toLocaleLowerCase('pt-BR')
  return disponiveis.value.filter((usuario) => `${usuario.name ?? ''} ${usuario.email ?? ''}`.toLocaleLowerCase('pt-BR').includes(termo))
})

function pesquisar(event) {
  if (enviando.value) return
  busca.value = event.target.value
  usuarioId.value = ''
  mostrarResultados.value = true
}
function selecionarUsuario(usuario) {
  if (enviando.value || !disponiveis.value.some((item) => String(item.id) === String(usuario.id))) return
  usuarioId.value = String(usuario.id)
  busca.value = `${usuario.name || 'Usuário'} — ${usuario.email}`
  mostrarResultados.value = false
}
function sairDaBusca(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) mostrarResultados.value = false
}
function focarResultado(event) {
  event.currentTarget.closest('.user-picker')?.querySelector('.user-option')?.focus()
}

async function carregar() {
  const id = equipeId.value
  carregando.value = true
  erro.value = ''
  usuarios.value = []
  try {
    const [lista, pedidos] = await Promise.all([
      userStore.getAllUsers(),
      pedidoStore.carregarPendentesProjeto(id),
    ])
    if (id !== equipeId.value || !aberto.value) return
    usuarios.value = lista
    convidados.value = new Set(pedidos.filter((pedido) => pedido.status === 'pendente').map((pedido) => String(pedido.usuario_detalhe?.id ?? idDe(pedido.usuario))))
  } catch (error) {
    if (id === equipeId.value && aberto.value) erro.value = apiErrorMessage(error, 'Não foi possível carregar os usuários. Tente novamente.')
  } finally {
    carregando.value = false
  }
}

function abrir() {
  if (!permitido.value || enviando.value || carregando.value) return
  busca.value = ''
  usuarioId.value = ''
  aberto.value = true
  carregar()
}

async function enviar() {
  if (!permitido.value || enviando.value || carregando.value) return
  const usuario = disponiveis.value.find((item) => String(item.id) === String(usuarioId.value))
  if (!usuario) return
  const id = equipeId.value
  enviando.value = true
  erro.value = ''
  try {
    const convite = await pedidoStore.convidarUsuario(id, usuario.id)
    if (id !== equipeId.value) return
    convidados.value.add(String(usuario.id))
    usuarioId.value = ''
    busca.value = ''
    mostrarResultados.value = false
    toast.success(`Convite enviado para ${usuario.name || usuario.email}.`)
    emit('enviado', convite)
  } catch (error) {
    if (id === equipeId.value) erro.value = apiErrorMessage(error, error.message || 'Não foi possível enviar o convite. Tente novamente.')
  } finally {
    enviando.value = false
  }
}

watch(equipeId, () => {
  aberto.value = false
  erro.value = ''
  usuarioId.value = ''
})
watch(permitido, (valor) => {
  if (valor) abrir()
  else aberto.value = false
}, { immediate: true })
</script>

<template>
  <section v-if="permitido" class="new-invite" aria-label="Convidar participante">
    <h2>Novo convite</h2>
      <form class="invite-form" @submit.prevent="enviar">
        <p>Selecione uma pessoa para participar de {{ projetoStore.projetoAtual?.nome }}.</p>
        <p v-if="carregando" role="status">Carregando usuários...</p>
        <template v-else>
          <label for="invite-search">Buscar por nome ou e-mail</label>
          <div class="user-picker" @focusout="sairDaBusca" @keydown.esc="mostrarResultados = false">
            <input
              id="invite-search"
              :value="busca"
              type="search"
              placeholder="Digite o nome ou e-mail e selecione o usuário"
              autocomplete="off"
              :disabled="enviando"
              :aria-expanded="mostrarResultados"
              aria-controls="invite-results"
              @input="pesquisar"
              @focus="mostrarResultados = !usuarioId"
              @keydown.down.prevent="focarResultado"
              @keydown.enter.prevent="focarResultado"
            />
            <ul v-if="mostrarResultados" id="invite-results" class="user-results" aria-label="Usuários encontrados">
              <li v-for="usuario in filtrados" :key="usuario.id">
                <button type="button" class="user-option" :disabled="enviando" @click="selecionarUsuario(usuario)">
                  <span class="mdi mdi-account-circle-outline" aria-hidden="true"></span>
                  <span><strong>{{ usuario.name || 'Usuário' }}</strong><small>{{ usuario.email }}</small></span>
                </button>
              </li>
              <li v-if="!filtrados.length" class="no-results">Nenhum usuário disponível. Participantes e pessoas com convite pendente não aparecem aqui.</li>
            </ul>
          </div>
          <p v-if="usuarioId" class="selected-user" role="status"><span class="mdi mdi-check-circle-outline" aria-hidden="true"></span> Usuário selecionado. Você pode enviar o convite.</p>
        </template>
        <div v-if="erro" class="error" role="alert">
          <p>{{ erro }}</p>
          <button v-if="!usuarios.length" type="button" :disabled="carregando || enviando" @click="carregar">Tentar novamente</button>
        </div>
        <AppButton type="submit" :disabled="carregando || enviando || !disponiveis.some((usuario) => String(usuario.id) === usuarioId)">{{ enviando ? 'Enviando...' : 'Enviar convite' }}</AppButton>
      </form>
  </section>
</template>

<style scoped>
.new-invite { max-width: 620px; }
.new-invite h2 { margin-bottom: 24px; font-size: 20px; color: var(--primaria); }
.invite-form { display: grid; gap: 14px; }
.invite-form label { font-weight: 600; }
.invite-form input { width: 100%; min-width: 0; padding: 10px 12px; border: 1px solid #8996a8; border-radius: 6px; background: white; color: var(--texto); }
.user-picker { position: relative; }
.user-results { position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 2; max-height: 260px; overflow-y: auto; padding: 6px; border: 1px solid #d7dde5; border-radius: 8px; background: #fff; box-shadow: 0 8px 24px rgb(0 18 40 / 12%); }
.user-option { display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px; border: 0; border-radius: 5px; background: transparent; color: var(--texto); text-align: left; cursor: pointer; }
.user-option:hover, .user-option:focus-visible { background: #edf3fa; }
.user-option .mdi { font-size: 30px; color: var(--primaria); }
.user-option > span:last-child { min-width: 0; }
.user-option strong, .user-option small { display: block; overflow-wrap: anywhere; }
.user-option small { color: #5f6875; }
.no-results { padding: 12px; font-size: 14px; color: #5f6875; }
.selected-user { color: #176b35; font-size: 14px; }
.error { color: #a12424; }
.error button { margin-top: 8px; cursor: pointer; }
</style>
