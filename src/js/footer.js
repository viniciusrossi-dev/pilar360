export function renderFooter() {
  const placeholder = document.getElementById('site-footer')
  if (!placeholder) return

  const year = new Date().getFullYear()

  placeholder.innerHTML = `
    <footer>
      <div class="footer-grid">
        <div class="footer-logo">
          <img src="/imagens/logo-vertical-negativo.svg" alt="Pilar 360">
          <div class="footer-selo">📘 Entrega com manual do proprietário e assistência pós-chaves</div>
        </div>
        <div>
          <b>Navegue</b>
          <a href="/#projetos">Projetos</a>
          <a href="/#sobre">Sobre nós</a>
          <a href="/blog.html">Blog</a>
          <a href="/#investidor">Área do investidor</a>
        </div>
        <div>
          <b>Fale com a gente</b>
          <a href="/#contato">💬 WhatsApp / Formulário</a>
          <a href="mailto:viniciusrossi@hotmail.com.br">viniciusrossi@hotmail.com.br</a>
          <a href="https://instagram.com/pilar360.construtora" target="_blank" rel="noopener">@pilar360.construtora</a>
        </div>
        <div>
          <b>Pilar 360 Construtora e Incorporadora Ltda</b>
          CNPJ 57.784.268/0001-89<br>
          Grande Porto Alegre · RS
          <div class="footer-legal">
            Imagens meramente ilustrativas.<br>
            Condições do programa MCMV sujeitas às regras vigentes da CAIXA.
          </div>
        </div>
      </div>
      <div class="footer-low">
        <span class="footer-copy">&copy; ${year} Pilar 360. Todos os direitos reservados.</span>
        <span class="footer-tagline">Construindo sonhos. Gerando valor.</span>
      </div>
    </footer>
  `
}
