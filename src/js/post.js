import { renderHeader } from './header.js'
import { renderFooter } from './footer.js'
import { supabase } from './supabase.js'

renderHeader()
renderFooter()

const params = new URLSearchParams(window.location.search)
const slug = params.get('slug')

if (!slug) {
  window.location.href = '/blog.html'
}

function formatDateLong(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function createRelatedCard(post) {
  return `
    <a href="/post.html?slug=${post.slug}" class="blog-card fade-in">
      ${post.imagem_capa_url
        ? `<div class="blog-card-img"><img src="${post.imagem_capa_url}" alt="${post.titulo}" loading="lazy"></div>`
        : ''}
      <div class="blog-card-body">
        <span class="blog-card-cat">${post.categoria || ''}</span>
        <h3 class="blog-card-titulo">${post.titulo}</h3>
        <p class="blog-card-resumo">${post.resumo || ''}</p>
        <span class="blog-card-data">${post.publicado_em ? new Date(post.publicado_em).toLocaleDateString('pt-BR') : ''}</span>
      </div>
    </a>
  `
}

async function loadRelated(categoria, currentSlug) {
  if (!categoria) return ''

  const { data } = await supabase
    .from('blog_post')
    .select('titulo, slug, resumo, categoria, imagem_capa_url, publicado_em')
    .eq('publicado', true)
    .eq('categoria', categoria)
    .neq('slug', currentSlug)
    .order('publicado_em', { ascending: false })
    .limit(3)

  if (!data || data.length === 0) return ''

  return `
    <section class="post-related">
      <div class="post-related-inner">
        <h2 class="post-related-title">Leia também</h2>
        <div class="blog-grid">
          ${data.map(createRelatedCard).join('')}
        </div>
      </div>
    </section>
  `
}

async function loadPost() {
  const main = document.getElementById('post-main')

  const { data: post, error } = await supabase
    .from('blog_post')
    .select('*')
    .eq('slug', slug)
    .eq('publicado', true)
    .single()

  if (error || !post) {
    window.location.href = '/blog.html'
    return
  }

  // Update page title
  document.title = `${post.titulo} — Pilar360`

  // Update OG tags
  document.querySelector('meta[property="og:title"]').setAttribute('content', post.titulo)
  document.querySelector('meta[property="og:description"]').setAttribute('content', post.resumo || '')
  if (post.imagem_capa_url) {
    document.querySelector('meta[property="og:image"]').setAttribute('content', post.imagem_capa_url)
  }

  const pageUrl = window.location.href
  const shareWhatsapp = `https://wa.me/?text=${encodeURIComponent(post.titulo + ' ' + pageUrl)}`

  const related = await loadRelated(post.categoria, slug)

  main.innerHTML = `
    ${post.imagem_capa_url
      ? `<div class="post-hero" style="background-image:url('${post.imagem_capa_url}')"></div>`
      : '<div class="post-hero-spacer"></div>'}

    <article class="post-article">
      <header class="post-header">
        ${post.categoria ? `<span class="blog-card-cat">${post.categoria}</span>` : ''}
        <h1 class="post-titulo">${post.titulo}</h1>
        <time class="post-data">${formatDateLong(post.publicado_em)}</time>
      </header>

      <div class="post-body">
        ${post.conteudo || ''}
      </div>

      <div class="post-share">
        <span class="post-share-label">Compartilhar:</span>
        <a href="${shareWhatsapp}" target="_blank" rel="noopener" class="btn-outline post-share-btn">WhatsApp</a>
        <button class="btn-outline post-share-btn" id="btn-copy-link">Copiar link</button>
      </div>

      <div class="post-cta">
        <p class="post-cta-text">Gostou? Conheça nossos projetos.</p>
        <a href="/#projetos" class="btn-primary">Ver Projetos</a>
      </div>
    </article>

    ${related}
  `

  // Copy link button
  document.getElementById('btn-copy-link').addEventListener('click', async function () {
    try {
      await navigator.clipboard.writeText(pageUrl)
      this.textContent = 'Copiado!'
      setTimeout(() => { this.textContent = 'Copiar link' }, 2000)
    } catch {
      this.textContent = 'Copiar link'
    }
  })

  // Fade-in observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible')
    })
  }, { threshold: 0.1 })
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el))
}

loadPost()
