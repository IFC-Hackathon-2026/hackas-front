
<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/forms/AppButton.vue'

const router = useRouter()

const eventos = ref([
  {
    id: 1,
    titulo: 'Produto 1',
    categoria: 'Categoria',
    imagem: null
  },
  {
    id: 2,
    titulo: 'Produto 2',
    categoria: 'Categoria',
    imagem: null
  },
  {
    id: 3,
    titulo: 'Produto 3',
    categoria: 'Categoria',
    imagem: null
  }
])

const eventosDestaque = computed(() => eventos.value.slice(0, 3))

function navegarPara(destino) {
  router.push({
    path: '/login',
    query: {
      redirect: destino
    }
  })
}

function explorarEventos() {
  navegarPara('/eventos')
}

function abrirSobre() {
  navegarPara('/sobre')
}

function voltarAoTopo() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>

<template>
  
  <main class="homepage">
    <div class="conteudo-superior">
      <img
        src="/onda-esquerda.png"
        class="onda onda-esquerda"
        alt=""
      />

      <img
        src="/onda-direita.png"
        class="onda onda-direita"
        alt=""
      />

      <section class="hero">
        <div class="hero-conteudo">
          <p class="hero-introducao">
            NOSSA EDUCAÇÃO, NOSSA CONEXÃO.
          </p>

          <h1>
            CONECTANDO PESSOAS,<br />
            COMPARTILHANDO<br />
            INFORMAÇÕES.
          </h1>

          <p class="hero-descricao">
            EXPLORE NOSSAS CAMPANHAS, ACOMPANHE OS
            EVENTOS E DESCUBRA AS INICIATIVAS QUE
            MOVIMENTAM A EDUCAÇÃO
          </p>

          <AppButton
            class="botao-explorar"
            @click="explorarEventos"
          >
            Explorar
            <span class="mdi mdi-arrow-right"></span>
          </AppButton>
        </div>
      </section>

      <section class="destaques">
        <div class="destaques-cabecalho">
          <h2>DESTAQUES</h2>

          <button
            type="button"
            class="link-ver-todos"
            @click="explorarEventos"
          >
            Ver todos
            <span class="mdi mdi-arrow-right"></span>
          </button>
        </div>

        <ul class="lista-eventos" tabindex="0" aria-label="Eventos em destaque">
          <li
            v-for="evento in eventosDestaque"
            :key="evento.id"
            class="card-evento"
          >
            <div class="evento-imagem">
              <img
                v-if="evento.imagem"
                :src="evento.imagem"
                :alt="evento.titulo"
              />
            </div>

            <div class="evento-informacoes">
              <div class="evento-textos">
                <h3>{{ evento.titulo }}</h3>
                <p>{{ evento.categoria }}</p>
              </div>

              <button
                type="button"
                class="evento-seta"
                :aria-label="`Ver evento ${evento.titulo}`"
                @click="navegarPara(`/eventos/${evento.id}`)"
              >
                <span class="mdi mdi-arrow-right"></span>
              </button>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <section class="compromisso">
      <div class="compromisso-conteudo">
        <h2>
          COMPROMISSO COM A QUALIDADE E A EDUCAÇÃO
        </h2>

        <p>
          Acreditamos que cada campanha e evento é uma oportunidade
          de transformar ideias em soluções de qualidade, valorizando
          pessoas, construindo relações de confiança e criando
          resultados que fazem sentido.
        </p>

       <AppButton
  variant="secondary"
  class="botao-sobre"
  @click="abrirSobre"
>
  Sobre nós
  <span class="mdi mdi-arrow-right"></span>
</AppButton>
      </div>
    </section>

    <div class="voltar-topo">
      <button
        type="button"
        aria-label="Voltar ao topo"
        @click="voltarAoTopo"
      >
        <span class="mdi mdi-arrow-up"></span>
      </button>
    </div>
  </main>
</template>

<style scoped>
.homepage {
  width: 100%;
  color: #071a35;
  overflow: clip;
}



.conteudo-superior {
  position: relative;
  isolation: isolate;
  width: 100vw;
  max-width: none;
  margin-left: calc(50% - 50vw);
  padding: 0;
  overflow: hidden;
}



.hero {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 390px;
  padding: 48px 24px 70px;
  text-align: center;
}

.hero-conteudo {
  position: relative;
  z-index: 1;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-introducao {
  font-size: 14px;
  font-weight: 700;
  color: #082e64;
  margin: 0 0 20px;
}

.hero h1 {
  font-size: clamp(26px, 3vw, 34px);
  font-weight: 800;
  line-height: 1.12;
  margin: 0;
}

.hero-descricao {
  max-width: 440px;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.25;
  color: #2767aa;
  margin: 28px 0;
}


.botao-explorar,
.botao-sobre {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 180px;
  height: 50px;
  min-height: 50px;
  padding: 0 16px;
  box-sizing: border-box;
  font-size: 1.25rem;
  font-weight: 700;
  border-radius: 6px;
}


.onda {
  position: absolute;
  height: auto;
  pointer-events: none;
  top: 50%;
  transform: translateY(-50%);
  z-index: 0;
}


.onda-esquerda {
  left: -27px;
  width: 750px;
  opacity: 0.5;
  transform: translate(-140px, -50%);
}

.onda-direita {
  right: -27px;
  width: 300px;
}

.destaques {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  padding: 30px 32px 100px;
}

.destaques-cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48px;
}

.destaques-cabecalho h2 {
  font-size: 26px;
  font-weight: 800;
  margin: 0;
}

.link-ver-todos {
  display: flex;
  align-items: center;
  gap: 12px;
  background: none;
  border: none;
  color: #082e64;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.link-ver-todos:hover {
  color: #2767aa;
}

.lista-eventos {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 70px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.card-evento {
  overflow: hidden;
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 5px 16px rgb(0 0 0 / 10%);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.card-evento:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 28px rgb(1 41 95 / 18%);
}

.evento-imagem {
  height: 200px;
  background-color: #e7e7e7;
  overflow: hidden;
}

.evento-imagem img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card-evento:hover .evento-imagem img {
  transform: scale(1.04);
}

.evento-informacoes {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 100px;
  padding: 18px;
}

.evento-textos {
  min-width: 0;
}

.evento-textos h3 {
  margin: 0 0 2px;
  font-size: 17px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.evento-textos p {
  margin: 0;
  font-size: 15px;
}

.evento-seta {
  flex-shrink: 0;
  border: none;
  background: none;
  color: #426b9c;
  font-size: 26px;
  cursor: pointer;
  transition:
    color 0.3s ease,
    transform 0.3s ease;
}

.card-evento:hover .evento-seta {
  color: #01295f;
  transform: translateX(5px);
}

.compromisso {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  max-width: none;
  margin-left: calc(50% - 50vw);
  min-height: 410px;
  padding: 60px 24px;
  box-sizing: border-box;
  text-align: center;
  background: #2767aa;
}

.compromisso-conteudo {
  position: relative;
  width: 100%;
  max-width: 740px;
  margin: 0 auto;
  transform-origin: center center;
}

@supports (animation-timeline: view()) {
  .compromisso-conteudo {
    animation: crescer-suavemente linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 80%;
  }
}

@keyframes crescer-suavemente {
  from {
    transform: scale(0.65);
  }

  to {
    transform: scale(1);
  }
}

.compromisso h2 {
  margin: 0 0 26px;
  font-size: 24px;
  font-weight: 800;
  color: #01295f;
}

.compromisso p {
  margin: 0 0 24px;
  font-size: 18px;
  line-height: 1.3;
  color: #f1f6fc;
}

.botao-sobre {
  background: #f6f6f2;
  color: #01295f;
  border-color: #f6f6f2;
  margin: 0 auto;
}

.botao-sobre:hover {
  background: #ffffff;
  color: #01295f;
}

.voltar-topo {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px;
}

.voltar-topo button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  background: #e7e7e7;
  color: #ffffff;
  font-size: 28px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.voltar-topo button:hover {
  background: #2767aa;
}

@media (max-width: 900px) {
  .lista-eventos {
    gap: 24px;
  }
}

@media (max-width: 600px) {
  .hero {
    min-height: 350px;
    padding: 48px 20px;
  }

  .hero h1 {
    font-size: 26px;
  }

  .onda-esquerda {
    width: 260px;
    opacity: 0.5;
  }

  .onda-direita {
    width: 130px;
    opacity: 0.5;
  }

  .destaques {
    padding: 35px 24px 70px;
  }

  .destaques-cabecalho h2 {
    font-size: 22px;
  }

  .lista-eventos {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .evento-imagem {
    height: 220px;
  }

  .compromisso {
    min-height: 350px;
  }

  .compromisso h2 {
    font-size: 21px;
  }

  .compromisso p {
    font-size: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .compromisso-conteudo {
    animation: none;
    transform: none;
  }

  .card-evento,
  .evento-imagem img,
  .evento-seta {
    transition: none;
  }
}

@media (max-width: 600px) {
  .destaques-cabecalho {
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  .link-ver-todos {
    min-height: 44px;
    flex-shrink: 0;
    gap: 0.5rem;
    font-size: 0.875rem;
  }
  .lista-eventos {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: 4px;
    overscroll-behavior-x: contain;
    padding: 12px 4px 24px;
    scrollbar-width: thin;
  }
  .card-evento {
    flex: 0 0 85%;
    min-width: 0;
    scroll-snap-align: start;
  }
  .card-evento:hover {
    transform: none;
  }
  .evento-imagem {
    height: 180px;
  }
  .evento-informacoes {
    padding: 14px;
    min-height: 88px;
  }
  .evento-textos h3 {
    font-size: 1rem;
  }
  .evento-textos p {
    font-size: 0.875rem;
  }
  .evento-seta {
    display: grid;
    place-items: center;
    min-width: 44px;
    min-height: 44px;
  }
  .lista-eventos:focus-visible {
    outline: 2px solid #2767aa;
    outline-offset: 4px;
  }
  .compromisso {
    padding: 40px 24px;
  }
  .compromisso h2 {
    font-size: 1.25rem;
  }
  .compromisso p {
    line-height: 1.6;
  }
}
</style>
