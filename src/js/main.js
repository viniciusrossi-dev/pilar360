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

// Blog preview
async function loadBlogPreview() {
  const grid = document.getElementById('blog-preview-grid')
  if (!grid) return
  const { data } = await supabase
    .from('blog_post')
    .select('titulo, slug, resumo, categoria, imagem_capa_url, publicado_em')
    .eq('publicado', true)
    .order('publicado_em', { ascending: false })
    .limit(3)
  if (!data || data.length === 0) {
    document.getElementById('blog-preview')?.remove()
    return
  }
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
  // Observe newly added cards
  grid.querySelectorAll('.fade-in').forEach(el => observer.observe(el))
}
loadBlogPreview()
