<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import projetosApi from '@/api/projetosApi'

const route = useRoute()
const router = useRouter()

const projeto = ref(null)
const carregando = ref(false)
const erro = ref('')

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '')

function obterUrlImagem(valor) {
  if (!valor) return ''

  if (typeof valor === 'object') {
    return obterUrlImagem(valor.url ?? valor.src ?? valor.file ?? valor.path)
  }

  if (typeof valor !== 'string') return ''

  if (/^https?:\/\//i.test(valor)) return valor

  if (valor.startsWith('/')) {
    return `${API_ORIGIN}${valor}`
  }

  return new URL(valor, `${API_ORIGIN}/`).href
}

const fotoProjeto = computed(() => {
  return obterUrlImagem(projeto.value?.foto_url ?? projeto.value?.foto)
})

const nomeProjeto = computed(() => {
  return projeto.value?.nome ?? projeto.value?.titulo ?? 'Projeto sem título'
})

const nomeCategoria = computed(() => {
  const categoria = projeto.value?.categoria

  if (categoria && typeof categoria === 'object') {
    return categoria.nome ?? 'Sem categoria'
  }

  return (
    projeto.value?.categoria_nome ?? (typeof categoria === 'string' ? categoria : 'Sem categoria')
  )
})

const descricaoProjeto = computed(() => {
  return (
    projeto.value?.descricao ??
    projeto.value?.description ??
    projeto.value?.detalhes ??
    projeto.value?.summary ??
    projeto.value?.texto ??
    projeto.value?.content ??
    ''
  )
})

async function carregarProjeto() {
  carregando.value = true
  erro.value = ''
  projeto.value = null

  try {
    const response = await projetosApi.detalhar(route.params.id)

    projeto.value = response.data

    // Mostra todos os dados recebidos do backend
    console.log('DADOS DO PROJETO:', response.data)

    // Mostra os campos disponíveis
    console.log('CAMPOS DO PROJETO:', Object.keys(response.data))

    // Verifica especificamente a descrição
    console.log('DESCRIÇÃO DO PROJETO:', response.data.descricao)
  } catch (error) {
    console.error('Erro ao buscar projeto:', error)

    erro.value = 'Não foi possível carregar os detalhes do projeto.'
  } finally {
    carregando.value = false
  }
}

onMounted(carregarProjeto)

watch(() => route.params.id, carregarProjeto)
</script>

<template>
  <main class="projeto-detalhes">
    <button class="voltar" @click="router.back()">
      <span class="mdi mdi-arrow-left"></span>
      Voltar
    </button>

    <p v-if="carregando">Carregando projeto...</p>

    <p v-else-if="erro">
      {{ erro }}
    </p>

    <article v-else-if="projeto" class="projeto-card">
      <img v-if="fotoProjeto" :src="fotoProjeto" :alt="nomeProjeto" class="projeto-foto" />

      <div class="projeto-conteudo">
        <span class="categoria">
          {{ nomeCategoria }}
        </span>

        <h1>{{ nomeProjeto }}</h1>

        <section>
          <h2>Sobre o projeto</h2>

          <p v-if="descricaoProjeto" class="descricao">
            {{ descricaoProjeto }}
          </p>

          <p v-else>Este projeto não possui uma descrição disponível.</p>
        </section>

        <section v-if="projeto.local">
          <h2>Local</h2>
          <p>{{ projeto.local }}</p>
        </section>

        <section v-if="projeto.data">
          <h2>Data</h2>
          <p>{{ projeto.data }}</p>
        </section>
      </div>
    </article>
  </main>
</template>

<style scoped>
.projeto-detalhes {
  width: min(1000px, 92%);
  margin: 40px auto 80px;
  color: #171717;
}

.voltar {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  padding: 10px 16px;
  border: 1px solid #2767aa;
  border-radius: 8px;
  background: white;
  color: #2767aa;
  cursor: pointer;
}

.projeto-card {
  overflow: hidden;
  border-radius: 12px;
  background: white;
  box-shadow: 0 5px 18px rgb(0 18 40 / 12%);
}

.projeto-foto {
  display: block;
  width: 100%;
  max-height: 450px;
  object-fit: cover;
}

.projeto-conteudo {
  padding: 32px;
}

.categoria {
  display: inline-block;
  margin-bottom: 16px;
  padding: 6px 16px;
  border-radius: 30px;
  background: #2767aa;
  color: white;
  font-size: 13px;
}

h1 {
  margin: 0 0 24px;
  font-size: clamp(26px, 4vw, 38px);
}

h2 {
  margin: 24px 0 10px;
  font-size: 20px;
}

.descricao {
  white-space: pre-line;
  line-height: 1.7;
}

@media (max-width: 600px) {
  .projeto-conteudo {
    padding: 20px;
  }
}
</style>
