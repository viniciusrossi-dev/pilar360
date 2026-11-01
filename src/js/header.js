import { EMPRESA } from '../data/obras.js'

const WA_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>`

export function waLink(texto = 'Olá! Vim pelo site da Pilar 360.') {
  return `https://wa.me/${EMPRESA.whatsapp}?text=${encodeURIComponent(texto)}`
}

export function waBotao(rotulo = 'Conversar no WhatsApp', texto) {
  return `<a class="btn" href="${waLink(texto)}" target="_blank" rel="noopener">${WA_ICON}${rotulo}</a>`
}

export function renderHeader(atual = '') {
  const placeholder = document.getElementById('site-header')
  if (!placeholder) return

  const cur = (k) => (atual === k ? ' aria-current="page"' : '')

  placeholder.innerHTML = `
    <a class="skip" href="#conteudo">Pular para o conteúdo</a>
    <header class="topo">
      <div class="wrap topo-in">
        <a href="/" class="topo-logo"><img src="/imagens/logo.svg" alt="Pilar 360 — página inicial" width="150" height="40"></a>
        <button class="topo-menu" aria-expanded="false" aria-controls="topo-nav">Menu</button>
        <ul class="topo-nav" id="topo-nav">
          <li><a href="/#obras"${cur('obras')}>Obras</a></li>
          <li><a href="/#empresa"${cur('empresa')}>A empresa</a></li>
          <li><a href="/#diario"${cur('diario')}>Diário de obra</a></li>
          <li><a href="/blog.html"${cur('blog')}>Blog</a></li>
          <li>${waBotao('WhatsApp')}</li>
        </ul>
      </div>
    </header>
  `

  const btn = placeholder.querySelector('.topo-menu')
  const nav = placeholder.querySelector('.topo-nav')
  btn.addEventListener('click', () => {
    const aberto = nav.classList.toggle('aberto')
    btn.setAttribute('aria-expanded', aberto)
    btn.textContent = aberto ? 'Fechar' : 'Menu'
  })
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('aberto')
    btn.setAttribute('aria-expanded', 'false')
    btn.textContent = 'Menu'
  }))

  const topo = placeholder.querySelector('.topo')
  const onScroll = () => topo.classList.toggle('rolou', window.scrollY > 8)
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
}
