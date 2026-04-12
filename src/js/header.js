export function renderHeader() {
  const placeholder = document.getElementById('site-header')
  if (!placeholder) return

  placeholder.innerHTML = `
    <nav>
      <a href="/" class="nav-logo">
        <img src="/imagens/logo.svg" alt="Pilar360">
      </a>
      <ul class="nav-links">
        <li><a href="/#sobre">Sobre</a></li>
        <li><a href="/#projetos">Projetos</a></li>
        <li><a href="/blog.html">Blog</a></li>
        <li><a href="/#valores">Nossa Essência</a></li>
        <li><a href="/#contato" class="nav-cta">Falar com a gente</a></li>
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

  window.addEventListener('scroll', () => {
    const nav = placeholder.querySelector('nav')
    if (!nav) return
    nav.style.background = window.scrollY > 50
      ? 'rgba(10,10,10,0.97)'
      : 'rgba(10,10,10,0.9)'
  })
}
