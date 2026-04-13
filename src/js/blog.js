import { renderHeader } from './header.js'
import { renderFooter } from './footer.js'
import { supabase } from './supabase.js'

renderHeader()
renderFooter()

const PAGE_SIZE = 20
let currentCat = 'todos'
let offset = 0
let totalCount = 0

const grid = document.getElementById('blog-grid')
const btnLoadMore = document.getElementById('btn-load-more')

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

function createCard(post) {
  const card = document.createElement('a')
  card.href = `/post.html?slug=${post.slug}`
  card.className = 'blog-card fade-in'

  card.innerHTML = `
    ${post.imagem_capa_url
      ? `<div class="blog-card-img"><img src="${post.imagem_capa_url}" alt="${post.titulo}" loading="lazy"></div>`
      : ''}
    <div class="blog-card-body">
      <span class="blog-card-cat">${post.categoria || ''}</span>
      <h3 class="blog-card-titulo">${post.titulo}</h3>
      <p class="blog-card-resumo">${post.resumo || ''}</p>
      <span class="blog-card-data">${formatDate(post.publicado_em)}</span>
    </div>
  `
  return card
}

function initFadeObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible')
    })
  }, { threshold: 0.1 })
  document.querySelectorAll('.fade-in:not(.visible)').forEach(el => observer.observe(el))
}

async function loadPosts(reset = false) {
  if (reset) {
    offset = 0
    grid.innerHTML = ''
  }

  let query = supabase
    .from('blog_post')
    .select('titulo, slug, resumo, categoria, imagem_capa_url, publicado_em', { count: 'exact' })
    .eq('publicado', true)
    .order('publicado_em', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (currentCat !== 'todos') {
    query = query.eq('categoria', currentCat)
  }

  const { data, count, error } = await query

  if (error) {
    console.error('Erro ao carregar posts:', error)
    return
  }

  if (reset) totalCount = count || 0

  if (!data || data.length === 0) {
    if (reset) {
      grid.innerHTML = '<p style="color:var(--branco-suave);padding:2rem 0;">Nenhum post encontrado.</p>'
    }
    btnLoadMore.style.display = 'none'
    return
  }

  data.forEach(post => grid.appendChild(createCard(post)))
  offset += data.length

  btnLoadMore.style.display = offset < totalCount ? 'inline-block' : 'none'

  initFadeObserver()
}

// Filtros
document.getElementById('blog-filters').addEventListener('click', (e) => {
  const btn = e.target.closest('.blog-filter-btn')
  if (!btn) return
  document.querySelectorAll('.blog-filter-btn').forEach(b => b.classList.remove('active'))
  btn.classList.add('active')
  currentCat = btn.dataset.cat
  loadPosts(true)
})

// Load more
btnLoadMore.addEventListener('click', () => loadPosts(false))

// Init
loadPosts(true)
