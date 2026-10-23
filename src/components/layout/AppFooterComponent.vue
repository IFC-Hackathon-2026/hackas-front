<script setup>
import LogoDark from '/FarolFlow-logo-dark.svg'
</script>

<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-brand">
        <img :src="LogoDark" alt="Farol flow logo dark" style="width: 180px; height: auto" />

        <p>
          <span
            >2026 &copy; Farol Flow <br />
            Todos os direitos reservados.</span
          >
        </p>
      </div>

      <div>
        <h4>Atendimento</h4>
        <ul class="infos-list">
          <li>
            <span class="mdi mdi-clock-outline"></span>
            Segunda à sexta - 8h às 17:30h
          </li>
          <li style="width: 70%;">
            Rodovia BR-280, km 27, nº 5200, bairro Colégio Agrícola, Araquari – SC, CEP 89245-000.
          </li>
        </ul>
      </div>

      <div>
        <h4>Contato</h4>
        <ul class="infos-list">
          <li>
            <span class="mdi mdi-phone"></span>
            (47) 3444-9160
          </li>
          <li>
            <span class="mdi mdi-whatsapp"></span>
            (47) 9 9293-8990
          </li>
          <li>
            <span class="mdi mdi-email-outline"></span>
            farolflow@gmail.com
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: 2rem;
  background-color: var(--primaria);
  flex-shrink: 0;
  color: var(--fundo-claro);
  padding: 3rem var(--page-padding);
}

.footer-content {
  width: 100%;
  margin-inline: auto;
  display: flex;
  justify-content: space-around;
  align-items: start;
  gap: 2.5rem;
}

.footer-content > div {
  min-width: 0;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

h4 {
  margin-bottom: 1rem;
}

.infos-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0;
}

.infos-list li {
  overflow-wrap: anywhere;
}

.mdi {
  margin-right: 0.5rem;
}

@media (max-width: 760px) {
  .app-footer {
    padding-block: 2rem;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
</style>
