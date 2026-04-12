export function renderFooter() {
  const placeholder = document.getElementById('site-footer')
  if (!placeholder) return

  const year = new Date().getFullYear()

  placeholder.innerHTML = `
    <footer>
      <img src="/imagens/logo.svg" alt="Pilar360" style="height:40px;">
      <div class="footer-tagline">Construindo sonhos. Gerando valor.</div>
      <div class="footer-copy">&copy; ${year} Pilar360 Incorporadora. Todos os direitos reservados.</div>
    </footer>
  `
}
