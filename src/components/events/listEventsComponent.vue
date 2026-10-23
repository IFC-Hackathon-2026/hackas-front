<script setup>
import AppButton from '../forms/AppButton.vue';

// deixar igual no back e no Fron, o nome das categorias
const estilos = {
  academicos: {
    cor: '#2767AA',
    cientificos: { icone: 'mdi-flask',},
    tecnologicos: { icone: 'mdi-laptop',},
    educacionais: { icone: 'mdi-school'},
    institucionais: { icone: 'mdi-domain',},
    corporativos:{ icone: 'mdi-briefcase-account-outline', },
  },


  culEartistico: {
    cor: ' #C795E5',
    culturais: { icone: 'mdi-drama-masks', },
    artisticos: { icone: 'mdi-palette-outline', },
    gastronomicos: { icone: 'mdi-silverware-clean', },
  },

  
  esportEcompet:{
    cor: '#EFAA73',
    esportivos: { icone: 'mdi-soccer', },
    competitivos: { icone: 'mdi-trophy', },
  },

  sociaisErecreat:{
    cor: '#E995B7',
    sociais: { icone: 'mdi-account-multiple', },
    recreativos: { icone: 'mdi-party-popper', },
    comunitarios: { icone: 'mdi-handshake-outline', },
  },

  politicosErelig:{
    cor: '#DFC46D',
    politicos: { icone: 'mdi-gavel', },
    diplomaticos: { icone: 'mdi-earth', },
    religiosos: { icone: 'mdi-hands-pray', },
  }

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

const categorias = Object.values(estilos).flatMap(({ cor, ...subcategorias }) =>
  Object.entries(subcategorias).map(([chave, { icone }]) => ({
    nome: nomesCategorias[chave],
    cor: cor.trim(),
    icone,
  })),
)

// Categoria de exemplo, sorteada uma vez ao montar o componente.
const categoria = categorias[Math.floor(Math.random() * categorias.length)]
const emit = defineEmits(['ver-detalhes'])
</script>

<template>
  <section class="event-list" aria-label="Eventos">
    <ul>
      <li>
        <article class="event-card">
          <div class="event-image" aria-hidden="true"></div>
          <div class="event-content">

            <!-- MUDAR ISSO COM O BACK -->
            <span class="event-category" :style="{ backgroundColor: categoria.cor }">
              <span :class="['mdi', categoria.icone]" aria-hidden="true"></span>
              {{ categoria.nome }}
            </span>

            <h2>Título</h2>
           <AppButton> Ver Detalhes <span class="mdi mdi-arrow-right"></span> </AppButton>
          </div>
        </article>
      </li>
    </ul>
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
