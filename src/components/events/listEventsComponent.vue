<script setup>
import { ref, onMounted, computed } from 'vue'
import AppButton from '../forms/AppButton.vue'
import projetosApi from '@/api/projetosApi'
import { useRouter } from 'vue-router';

const estilos = {
  academicos: {
    cor: '#2767AA',
    cientificos: { icone: 'mdi-flask' },
    tecnologicos: { icone: 'mdi-laptop' },
    educacionais: { icone: 'mdi-school' },
    institucionais: { icone: 'mdi-domain' },
    corporativos: { icone: 'mdi-briefcase-account-outline' },
  },

  culEartistico: {
    cor: '#C795E5',
    culturais: { icone: 'mdi-drama-masks' },
    artisticos: { icone: 'mdi-palette-outline' },
    gastronomicos: { icone: 'mdi-silverware-clean' },
  },

  esportEcompet: {
    cor: '#EFAA73',
    esportivos: { icone: 'mdi-soccer' },
    competitivos: { icone: 'mdi-trophy' },
  },

  sociaisErecreat: {
    cor: '#E995B7',
    sociais: { icone: 'mdi-account-multiple' },
    recreativos: { icone: 'mdi-party-popper' },
    comunitarios: { icone: 'mdi-handshake-outline' },
  },

  politicosErelig: {
    cor: '#DFC46D',
    politicos: { icone: 'mdi-gavel' },
    diplomaticos: { icone: 'mdi-earth' },
    religiosos: { icone: 'mdi-hands-pray' },
  },
}

const nomesCategorias = {
  cientificos: 'Científico',
  tecnologicos: 'Tecnológico',
  educacionais: 'Educacional',
  institucionais: 'Institucional',
  corporativos: 'Corporativo',
  culturais: 'Cultural',
  artisticos: 'Artístico',
  gastronomicos: 'Gastronômico',
  esportivos: 'Esportivo',
  competitivos: 'Competitivo',
  sociais: 'Social',
  recreativos: 'Recreativo',
  comunitarios: 'Comunitário',
  politicos: 'Político',
  diplomaticos: 'Diplomático',
  religiosos: 'Religioso',
}

const router = useRouter();

function abrirDetalhes(projeto) {
  if (projeto.id == null) return;

  router.push({
    name: 'projeto-detalhes',
    params: { id: projeto.id }
  });
}

const props = defineProps({
  busca: {
    type: String,
    default: '',
  },
  categoriasSelecionadas: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['ver-detalhes'])

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api').replace(
  /\/api\/?$/,
  '',
)

const projetos = ref([])
const carregando = ref(false)
const erro = ref('')

function obterUrlImagem(valor) {
  if (!valor) return ''

  if (typeof valor === 'string') {
    if (/^https?:\/\//i.test(valor)) return valor
    if (valor.startsWith('/')) return `${API_ORIGIN}${valor}`
    return valor
  }

  if (typeof valor === 'object') {
    return obterUrlImagem(valor.url ?? valor.src ?? valor.file ?? valor.path ?? '')
  }

  return ''
}

function obterUrlImagemDoProjeto(projeto) {
  const foto = projeto?.foto
  const fotoUrl = projeto?.foto_url

  if (typeof foto === 'string') return obterUrlImagem(foto)
  if (foto && typeof foto === 'object') return obterUrlImagem(foto.url)
  if (fotoUrl) return obterUrlImagem(fotoUrl)

  return ''
}

async function buscarProjetos() {
  carregando.value = true
  erro.value = ''

  try {
    const response = await projetosApi.listar()

    const dados = Array.isArray(response.data) ? response.data : (response.data?.results ?? [])

    projetos.value = dados

    console.log('Projetos carregados:', projetos.value)
    console.log('Primeiro projeto:', projetos.value[0])
    console.log('Foto:', projetos.value[0]?.foto)
    console.log('Foto URL:', projetos.value[0]?.foto_url)

    projetos.value.forEach((projeto) => {
      console.log(`Projeto ${projeto.id} - Foto:`, projeto.foto)

      console.log(`Projeto ${projeto.id} - Foto URL:`, projeto.foto_url)
    })
  } catch (error) {
    console.error('Erro ao buscar projetos:', error)

    erro.value = 'Não foi possível carregar os projetos.'
    projetos.value = []
  } finally {
    carregando.value = false
  }
}

const projetosFiltrados = computed(() => {
  const texto = props.busca.toLowerCase().trim()

  return projetos.value.filter((projeto) => {
    const nomeProjeto = String(projeto.nome ?? projeto.titulo ?? '').toLowerCase()

    const correspondeBusca = nomeProjeto.includes(texto)

    const categoriaId = projeto.categoria_id ?? projeto.categoria?.id ?? projeto.categoria

    const correspondeCategoria =
      props.categoriasSelecionadas.length === 0 ||
      props.categoriasSelecionadas.some((id) => String(id) === String(categoriaId))

    return correspondeBusca && correspondeCategoria
  })
})

function normalizarNome(nome) {
  return String(nome ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
}

function obterEstiloCategoria(nome) {
  const chave = normalizarNome(nome)

  for (const grupo of Object.values(estilos)) {
    for (const [categoriaChave, configuracao] of Object.entries(grupo)) {
      if (categoriaChave === 'cor') continue

      const nomeExibicao = nomesCategorias[categoriaChave]

      if (normalizarNome(categoriaChave) === chave || normalizarNome(nomeExibicao) === chave) {
        return {
          cor: grupo.cor.trim(),
          icone: configuracao.icone,
        }
      }
    }
  }

  return {
    cor: '#2767AA',
    icone: 'mdi-calendar',
  }
}

function obterNomeCategoria(projeto) {
  if (typeof projeto.categoria === 'object' && projeto.categoria !== null) {
    return projeto.categoria.nome ?? 'Sem categoria'
  }

  return (
    projeto.categoria_nome ??
    (typeof projeto.categoria === 'string' ? projeto.categoria : 'Sem categoria')
  )
}

function obterNomeProjeto(projeto) {
  return projeto.nome ?? projeto.titulo ?? 'Projeto sem título'
}

onMounted(buscarProjetos)
</script>

<template>
  <section class="event-list" aria-label="Eventos">
    <p v-if="carregando">Carregando projetos...</p>

    <p v-else-if="erro">
      {{ erro }}
    </p>

    <template v-else>
      <ul>
        <li v-for="projeto in projetosFiltrados" :key="projeto.id">
          <article class="event-card">
            <div class="event-image">
              <img
                v-if="obterUrlImagemDoProjeto(projeto)"
                :src="obterUrlImagemDoProjeto(projeto)"
                :alt="obterNomeProjeto(projeto)"
                class="event-photo"
              />
            </div>

            <div class="event-content">

              <span
                class="event-category"
                :style="{
                  backgroundColor: obterEstiloCategoria(obterNomeCategoria(projeto)).cor,
                }"
              >
                <span
                  :class="['mdi', obterEstiloCategoria(obterNomeCategoria(projeto)).icone]"
                  aria-hidden="true"
                ></span>

                {{ obterNomeCategoria(projeto) }}
              </span>

              <h2>{{ obterNomeProjeto(projeto) }}</h2>

             <AppButton @click="abrirDetalhes(projeto)">
                Ver Detalhes
                <span class="mdi mdi-arrow-right"></span>
              </AppButton>
            </div>
          </article>
        </li>
      </ul>

      <p v-if="projetosFiltrados.length === 0">Nenhum projeto encontrado.</p>
    </template>
  </section>
</template>

<style scoped>
.event-list {
  width: min(1120px, 92%);
  margin: 32px auto 64px;
}

.event-list > ul {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  padding: 0;
  list-style: none;
}

.event-list > ul > li {
  min-width: 0;
}

.event-card {
  width: 100%;
  overflow: hidden;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 5px 18px rgb(0 18 40 / 12%);
}

.event-image {
  aspect-ratio: 390 / 290;
  background: #e8e8e8;
  overflow: hidden;
}

.event-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-content {
  display: flex;
  flex-direction: column;
  padding: 10px 28px 30px;
}

.event-category {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: flex-end;
  gap: 12px;
  min-width: 178px;
  max-width: 100%;
  padding: 2px 16px;
  border-radius: 80px;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.event-category .mdi {
  font-size: 18px;
  line-height: 1;
}

.event-content h2 {
  margin: 16px 0 10px;
  color: #171717;
  font-size: 20px;
  font-weight: 600;
}

.event-details {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  align-self: center;
  width: fit-content;
  min-height: 0;
  padding: 3px 12px;
  border: 2px solid #2767aa;
  border-radius: 8px;
  background: #fff;
  color: var(--primaria);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.event-details .mdi {
  color: #4d6e98;
  font-size: 16px;
  line-height: 1;
}

.event-details:hover {
  background: #f0f5fb;
}

.event-details:focus-visible {
  outline: 3px solid var(--primaria);
  outline-offset: 3px;
}

@media (max-width: 900px) {
  .event-list > ul {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .event-list > ul {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
