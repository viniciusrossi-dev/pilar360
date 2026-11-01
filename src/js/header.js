export function renderHeader() {
  const placeholder = document.getElementById('site-header')
  if (!placeholder) return

  placeholder.innerHTML = `
    <nav>
      <a href="/" class="nav-logo">
        <img src="/imagens/logo.svg" alt="Pilar 360 — Construtora e Incorporadora">
      </a>
      <ul class="nav-links">
        <li><a href="/#projetos">Projetos</a></li>
        <li><a href="/#sobre">Sobre</a></li>
        <li><a href="/blog.html">Blog</a></li>
        <li><a href="/#investidor" class="nav-cta-ghost">Quero investir</a></li>
        <li><a href="/#contato" class="nav-cta">💬 Quero morar</a></li>
      </ul>
      <button class="nav-hamburger" aria-label="Abrir menu" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  `

  const hamburger = placeholder.querySelector('.nav-hamburger')
  const navLinks = placeholder.querySelector('.nav-links')

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('nav-open')
    hamburger.classList.toggle('active', isOpen)
    hamburger.setAttribute('aria-expanded', isOpen)
  })

  // fecha o menu ao navegar
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('nav-open')
    hamburger.classList.remove('active')
  }))

  window.addEventListener('scroll', () => {
    const nav = placeholder.querySelector('nav')
    if (!nav) return
    nav.classList.toggle('scrolled', window.scrollY > 50)
  })
}
