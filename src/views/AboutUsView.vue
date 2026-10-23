<script setup></script>

<template>
  <section>
    <div class="topo-container">
      <ul class="topo">
        <li class="blue">Quem somos</li>
        <li class="destaque">
          MAIS DO QUE CAMPANHAS, COMPARTILHAMOS PROPÓSITOS (MUDAR)
        </li>
        <li class="blue">
          SOMOS UMA EMPRESA DEDICADA A OFERECER CAMPANHAS E EVENTOS
          INOVADORES E DE ALTA QUALIDADE, COM FOCO NA SATISFAÇÃO E
          APRENDIZADO DE TODOS.
        </li>
      </ul>

      <p class="topo-imagem">
        <img src="/topo.jpg" alt="Topo" />
      </p>
    </div>

    <h1>DESENVOLVEDORES</h1>
  </section>

  <section>
    <ul class="devs">
      <li>
        <p><img src="" alt="" /></p>
        <p class="nomes">Carlos Henrique Pereira Santos</p>
        <a href="https://mail.google.com/mail/?view=cm&fs=1&to=ifcarloshenrique@email.com" 
        target="_blank"
        rel="noopener noreferrer"
        class="link-icon"
        >
           <span class="mdi mdi-gmail"></span>
        </a>

        <a 
        href="https://github.com/carloshenriqueok"
        target="_blank"
        rel="noopener noreferrer"
        class="link-icon"
        >
        <span class="mdi mdi-github"></span>
        </a>
       
      </li>

       <li>
        <p><img src="" alt="" /></p>
        <p class="nomes">Kauan dos Santos Luciano</p>
        <a href="https://mail.google.com/mail/?view=cm&fs=1&to=kauanlucianoinfo3ifc@email.com" 
        target="_blank"
        rel="noopener noreferrer"
        class="link-icon"
        >
           <span class="mdi mdi-gmail"></span>
        </a>

        <a 
        href="https://github.com/diakauankl"
        target="_blank"
        rel="noopener noreferrer"
        class="link-icon"
        >
        <span class="mdi mdi-github"></span>
        </a>
       
      </li>

     <li>
        <p><img src="" alt="" /></p>
        <p class="nomes">Laura Eloysa da Silva</p>
        <a href="https://mail.google.com/mail/?view=cm&fs=1&to=lauraeloysad@gmail.com" 
        target="_blank"
        rel="noopener noreferrer"
        class="link-icon"
        >
           <span class="mdi mdi-gmail"></span>
        </a>

        <a 
        href="https://github.com/LauraEloysa"
        target="_blank"
        rel="noopener noreferrer"
        class="link-icon"
        >
        <span class="mdi mdi-github"></span>
        </a>
       
      </li>

      <li>
        <p><img src="" alt="" /></p>
        <p class="nomes">Maria Aparecida dos Santos Costa</p>
        <a href="https://mail.google.com/mail/?view=cm&fs=1&to=mariaaparecida.ifc.araquari@gmail.com" 
        target="_blank"
        rel="noopener noreferrer"
        class="link-icon"
        >
           <span class="mdi mdi-gmail"></span>
        </a>

        <a 
        href="https://github.com/mariisbx"
        target="_blank"
        rel="noopener noreferrer"
        class="link-icon"
        >
        <span class="mdi mdi-github"></span>
        </a>
       
      </li>
      <li>
        <p><img src="" alt="" /></p>
        <p class="nomes">Pedro Gabriel Gonçalves</p>
        <a href="https://mail.google.com/mail/?view=cm&fs=1&to=pedrogabrielgoncalves91@gmail.com" 
        target="_blank"
        rel="noopener noreferrer"
        class="link-icon"
        >
           <span class="mdi mdi-gmail"></span>
        </a>

        <a 
        href="https://github.com/PedGabriel"
        target="_blank"
        rel="noopener noreferrer"
        class="link-icon"
        >
        <span class="mdi mdi-github"></span>
        </a>
       
      </li>
    </ul>
  </section>

  <section class="secao-history">
    <div class="history">
      <div class="history-imagens">
        <img src="/sobre-nos-1.jpg" alt="" class="foto1" />
        <img src="/sobre-nos-2.jpg" alt="" class="foto2" />
      </div>

      <div class="history-texto">
        <h1>Nossa História</h1>

        <p>
          SOMOS UMA EMPRESA DEDICADA A OFERECER SOLUÇÕES INOVADORAS
          E DE ALTA QUALIDADE, COM FOCO NA SATISFAÇÃO DOS NOSSOS
          CLIENTES. SOMOS UMA EMPRESA DEDICADA A OFERECER SOLUÇÕES
          INOVADORAS E DE ALTA QUALIDADE, COM FOCO NA SATISFAÇÃO
          DOS NOSSOS CLIENTES.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.topo-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 40px;
  padding: 0 10%;
}

.topo-imagem {
  width: 45%;
  margin: 0;
  flex-shrink: 0;
}

.topo-imagem img {
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
  margin: 4rem auto 0;
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
.secao-history {
  width: 100%;
  margin: 5vw 0 7vw;
}

.history {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  gap: 5%;
  width: 90%;
  margin: 0 auto;
}
.history-imagens {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 15px;
  width: 45%;
  padding: 0;
}

.history-imagens img {
  display: block;
  object-fit: cover;
  border-radius: 3px;
}

.history-imagens .foto1 {
  width: 40%;
  height: 160px;
  margin-top: 0;
}

.history-imagens .foto2 {
  width: 35%;
  height: 155px;
  margin-top: 60px;
}


.history-texto {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 15px;
  width: 40%;
  padding: 0;
}

.history-texto h1 {
  text-align: left;
  color: #01295f;
  margin: 0;
  font-size: 1.6rem;
}

.history-texto p {
  display: block;
  color: #141414;
  font-size: 1rem;
  line-height: 1.3;
  margin: 0;
  width: 70%;
}
span.mdi {
  font-size: 1.5rem;
  color: #141414;
}
</style>