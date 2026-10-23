<script setup></script>

<template>
  <section>
    <div>
      <ul class="topo">
        <li class="blue">Quem somos</li>
        <li class="destaque">MAIS DO QUE CAMPANHAS, COMPARTILHAMOS PROPÓSITOS (MUDAR)</li>
        <li class="blue">
          SOMOS UMA EMPRESA DEDICADA A OFERECER CAMPANHAS E EVENTOS INOVADORES E DE ALTA QUALIDADE,
          COM FOCO NA SATISFAÇÃO E APRENDIZADO DE TODOS.
        </li>
      </ul>
      <p><img src="/public/topo.jpg" alt="topo" /></p>
    </div>

    <h1>DESENVOLVEDORES</h1>
  </section>

  <section>
    <ul class="devs">
      <li>
        <p><img src="" alt="" /></p>
        <p class="nomes">Carlos Henrique Pereira Santos</p>
        <span class="mdi mdi-gmail"></span>
        <span class="mdi mdi-github"></span>
      </li>
      <li>
        <p><img src="" alt="" /></p>
        <p class="nomes">Kauan dos Santos Luciano</p>
        <span class="mdi mdi-gmail"></span>
        <span class="mdi mdi-github"></span>
      </li>
      <li>
        <p><img src="" alt="" /></p>
        <p class="nomes">Laura Eloysa Da Silva</p>
        <span class="mdi mdi-gmail"></span>
        <span class="mdi mdi-github"></span>
      </li>
      <li>
        <p><img src="" alt="" /></p>
        <p class="nomes">Maria Aparecida Dos Santos Costa</p>
        <span class="mdi mdi-gmail"></span>
        <span class="mdi mdi-github"></span>
      </li>
      <li>
        <p><img src="" alt="" /></p>
        <p class="nomes">Pedro Gabriel Gonçalves</p>
        <span class="mdi mdi-gmail"></span>
        <span class="mdi mdi-github"></span>
      </li>
    </ul>
  </section>
  
  <section>
    <ul class="history">
      <li><img src="/public/topo.jpg" alt="topo" /></li>
      <li class="history">
        <h1 class="history">Nossa História</h1>
        <p class="history">
            SOMOS UMA EMPRESA DEDICADA A OFERECER SOLUÇÕES INOVADORAS E DE ALTA QUALIDADE, COM FOCO NA SATISFAÇÃO OS NOSSOS CLIENTES.SOMOS UMA EMPRESA DEDICADA A OFERECER SOLUÇÕES INOVADORAS E DE ALTA QUALIDADE, COM FOCO NA SATISFAÇÃO OS NOSSOS CLIENTES.
        </p>
      </li>
    </ul>
  </section>
</template>

<style scoped>
div {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 300px;
  padding: 0 10%;
}

div > p {
  width: 45%;
  margin: 0;
  flex-shrink: 0;
}

div > p img {
  width: 100%;
  height: auto;
  object-fit: cover;
}

ul.topo {
  width: 45%;
  max-width: 500px;
  margin: 0;
  padding: 0;
  list-style: none;
}
p {
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

ul.topo {
  max-width: 30%;
  margin: 0 auto;
  padding: 0;
  list-style: none;
}

ul.topo li {
  max-width: 100%;
  padding: 5px;
  margin: 5px auto;
}

li.destaque {
  font-size: 2rem;
  color: #141414;
}

li.blue {
  color: #01295f;
  font-size: 1.3rem;
}

img {
  width: 100%;
  height: 100%;
}

h1 {
  text-align: center;
  color: #141414;
  margin-top: 4rem;
}

ul.devs {
  display: flex;
  justify-content: center;
  gap: 7vw;
  width: 80%;
  list-style: none;
  padding: 0;
  margin: 0 auto;
  margin-top: 4rem;
}

ul.devs li {
  text-align: center;
  width: fit-content;
}

.nomes {
  text-align: center;
  color: #141414;
  font-size: 1.2rem;
  width: fit-content;
  margin: 0 auto;
}
ul.history {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 5vw 0 7vw 0;
}
li.history {
  width: 25%;
}
h1.history {
   text-align: left;
  margin: 2rem auto 0;
  color: #01295F;
}
p.history {
  font-size: 1.2rem;
}
</style>
