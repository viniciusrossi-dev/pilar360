import { renderHeader } from './header.js'
import { renderFooter } from './footer.js'
import { initContactForm } from './formspree.js'
import { supabase } from './supabase.js'

renderHeader()
renderFooter()
initContactForm()

// Fade-in on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible')
  })
}, { threshold: 0.1 })
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el))

// Blog preview — mostra os pilares de conteúdo imediatamente;
// substitui por posts reais se/quando a consulta retornar.
const FALLBACK_CARDS = `
      <a href="/blog.html" class="blog-card fade-in">
        <div class="blog-card-body">
          <span class="blog-card-cat">Diário de obra</span>
          <h3 class="blog-card-titulo">Acompanhe a evolução dos nossos empreendimentos</h3>
          <p class="blog-card-resumo">O andamento de cada obra, com fotos e próximos passos.</p>
        </div>
      </a>
      <a href="/blog.html" class="blog-card fade-in">
        <div class="blog-card-body">
          <span class="blog-card-cat">Guia do comprador</span>
          <h3 class="blog-card-titulo">Tudo sobre o caminho até o seu primeiro imóvel</h3>
          <p class="blog-card-resumo">Financiamento MCMV, documentação e dicas práticas.</p>
        </div>
      </a>
      <a href="/blog.html" class="blog-card fade-in">
        <div class="blog-card-body">
          <span class="blog-card-cat">Investidor</span>
          <h3 class="blog-card-titulo">Oportunidades e números do mercado da Grande POA</h3>
          <p class="blog-card-resumo">Conteúdo para quem investe em imóveis compactos.</p>
        </div>
      </a>`

function observeCards(grid) {
  grid.querySelectorAll('.fade-in').forEach(el => observer.observe(el))
}

async function loadBlogPreview() {
  const grid = document.getElementById('blog-preview-grid')
  if (!grid) return
  grid.innerHTML = FALLBACK_CARDS
  observeCards(grid)
  let data = null
  try {
    const res = await supabase
      .from('blog_post')
      .select('titulo, slug, resumo, categoria, imagem_capa_url, publicado_em')
      .eq('publicado', true)
      .order('publicado_em', { ascending: false })
      .limit(3)
    data = res.data
  } catch (e) {
    data = null
  }
  if (!data || data.length === 0) return
  grid.innerHTML = data.map(post => `
    <a href="/post.html?slug=${post.slug}" class="blog-card fade-in">
      ${post.imagem_capa_url ? `<div class="blog-card-img"><img src="${post.imagem_capa_url}" alt="${post.titulo}" loading="lazy"></div>` : ''}
      <div class="blog-card-body">
        <span class="blog-card-cat">${post.categoria || ''}</span>
        <h3 class="blog-card-titulo">${post.titulo}</h3>
        <p class="blog-card-resumo">${post.resumo || ''}</p>
        <span class="blog-card-data">${post.publicado_em ? new Date(post.publicado_em).toLocaleDateString('pt-BR') : ''}</span>
      </div>
    </a>
  `).join('')
  observeCards(grid)
}
loadBlogPreview()
