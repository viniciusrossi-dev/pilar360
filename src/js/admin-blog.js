import Quill from 'quill'
import { requireAuth } from './auth.js'
import { supabase } from './supabase.js'
import { renderAdminLayout } from './admin-layout.js'

// Guard: redireciona para login se não autenticado
const session = await requireAuth()
if (!session) throw new Error('Not authenticated')

// Monta sidebar ao redor do conteúdo existente no div#admin-layout
renderAdminLayout('blog')

// Estado global
let currentPostId = null
let quill = null

// ─── Utilitários ──────────────────────────────────────────────────────

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function toSlug(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function showToast(msg, isError = false) {
  const el = document.getElementById('toast-msg')
  if (!el) return
  el.textContent = msg
  el.className = isError ? 'admin-error visible' : 'admin-success visible'
  setTimeout(() => { el.className = isError ? 'admin-error' : 'admin-success' }, 4000)
}

function container() {
  return document.getElementById('admin-blog-content')
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const categoriaLabel = {
  empresa: 'Empresa',
  mercado: 'Mercado',
  dicas: 'Dicas',
}

// ─── LIST VIEW ────────────────────────────────────────────────────────

async function showList() {
  currentPostId = null
  quill = null
  const cont = container()
  if (!cont) return

  cont.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;">
      <div>
        <h1 class="admin-page-title" style="margin-bottom:0.25rem;">Blog</h1>
        <p class="admin-page-subtitle" style="margin-bottom:0;">Gerencie os posts do blog</p>
      </div>
      <button class="admin-btn-primary" id="btn-novo-post">+ Novo Post</button>
    </div>
    <div id="toast-msg" class="admin-success"></div>
    <div id="blog-table-wrap">
      <div class="admin-empty"><div class="admin-empty-icon">⏳</div>Carregando posts…</div>
    </div>
  `

  document.getElementById('btn-novo-post')?.addEventListener('click', () => showForm(null))

  const { data: posts, error } = await supabase
    .from('blog_post')
    .select('id, titulo, slug, categoria, publicado, publicado_em, created_at')
    .order('created_at', { ascending: false })

  const wrap = document.getElementById('blog-table-wrap')
  if (!wrap) return

  if (error) {
    wrap.innerHTML = `<div class="admin-empty"><div class="admin-empty-icon">⚠️</div>Erro ao carregar posts.</div>`
    console.error(error)
    return
  }

  if (!posts || posts.length === 0) {
    wrap.innerHTML = `<div class="admin-empty"><div class="admin-empty-icon">📝</div>Nenhum post criado ainda.</div>`
    return
  }

  const rows = posts.map(p => `
    <tr>
      <td>
        <div style="font-weight:600;color:var(--admin-text-primary);">${escHtml(p.titulo)}</div>
        <div style="font-size:0.75rem;color:var(--admin-text-muted);margin-top:2px;">${escHtml(p.slug)}</div>
      </td>
      <td>${escHtml(categoriaLabel[p.categoria] ?? p.categoria ?? '—')}</td>
      <td>
        ${p.publicado
          ? '<span style="color:var(--admin-verde);font-weight:600;">Publicado</span>'
          : '<span style="color:var(--admin-text-muted);font-weight:600;">Rascunho</span>'}
      </td>
      <td>${formatDate(p.publicado_em ?? p.created_at)}</td>
      <td>
        <div style="display:flex;gap:0.5rem;">
          <button class="admin-btn-secondary btn-editar" data-id="${p.id}" style="padding:0.3rem 0.75rem;font-size:0.8rem;">Editar</button>
          <button class="admin-btn-danger btn-excluir" data-id="${p.id}" data-titulo="${escHtml(p.titulo)}" style="padding:0.3rem 0.75rem;font-size:0.8rem;">Excluir</button>
        </div>
      </td>
    </tr>
  `).join('')

  wrap.innerHTML = `
    <div style="background:var(--admin-card);border:1px solid var(--admin-border);border-radius:10px;overflow:hidden;">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Título / Slug</th>
            <th>Categoria</th>
            <th>Status</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `

  wrap.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', () => showForm(btn.dataset.id))
  })

  wrap.querySelectorAll('.btn-excluir').forEach(btn => {
    btn.addEventListener('click', () => deletePost(btn.dataset.id, btn.dataset.titulo))
  })
}

async function deletePost(id, titulo) {
  if (!confirm(`Excluir o post "${titulo}"? Esta ação não pode ser desfeita.`)) return

  const { error } = await supabase.from('blog_post').delete().eq('id', id)

  if (error) {
    alert('Erro ao excluir post: ' + error.message)
    return
  }

  await showList()
  showToast('Post excluído com sucesso.')
}

// ─── EDIT FORM ────────────────────────────────────────────────────────

async function showForm(postId) {
  currentPostId = postId
  const cont = container()
  if (!cont) return

  let post = null
  if (postId) {
    const { data, error } = await supabase
      .from('blog_post')
      .select('*')
      .eq('id', postId)
      .single()
    if (error) {
      alert('Erro ao carregar post.')
      console.error(error)
      return
    }
    post = data
  }

  cont.innerHTML = `
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;">
      <button class="admin-btn-secondary" id="btn-voltar" style="padding:0.4rem 1rem;">← Voltar</button>
      <div>
        <h1 class="admin-page-title" style="margin-bottom:0;">${postId ? 'Editar Post' : 'Novo Post'}</h1>
      </div>
    </div>
    <div id="toast-msg" class="admin-success"></div>

    <div style="background:var(--admin-card);border:1px solid var(--admin-border);border-radius:10px;padding:1.75rem;display:flex;flex-direction:column;gap:1.25rem;">

      <!-- Título -->
      <div class="admin-form-group">
        <label class="admin-label">Título *</label>
        <input type="text" id="f-titulo" class="admin-input" placeholder="Título do post" value="${escHtml(post?.titulo ?? '')}">
      </div>

      <!-- Slug -->
      <div class="admin-form-group">
        <label class="admin-label">Slug *</label>
        <input type="text" id="f-slug" class="admin-input" placeholder="url-do-post" value="${escHtml(post?.slug ?? '')}">
      </div>

      <!-- Categoria -->
      <div class="admin-form-group">
        <label class="admin-label">Categoria *</label>
        <select id="f-categoria" class="admin-input">
          <option value="">Selecione…</option>
          <option value="empresa" ${post?.categoria === 'empresa' ? 'selected' : ''}>Empresa</option>
          <option value="mercado" ${post?.categoria === 'mercado' ? 'selected' : ''}>Mercado</option>
          <option value="dicas" ${post?.categoria === 'dicas' ? 'selected' : ''}>Dicas</option>
        </select>
      </div>

      <!-- Imagem de capa -->
      <div class="admin-form-group">
        <label class="admin-label">Imagem de Capa</label>
        <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;">
          <input type="text" id="f-imagem-url" class="admin-input" placeholder="https://..." value="${escHtml(post?.imagem_capa_url ?? '')}" style="flex:1;min-width:200px;">
          <label class="admin-btn-secondary" style="padding:0.45rem 1rem;cursor:pointer;white-space:nowrap;">
            📎 Upload
            <input type="file" id="f-imagem-file" accept="image/*" style="display:none;">
          </label>
        </div>
        <div id="upload-status" style="font-size:0.78rem;color:var(--admin-text-muted);margin-top:4px;"></div>
      </div>

      <!-- Resumo -->
      <div class="admin-form-group">
        <label class="admin-label">Resumo</label>
        <textarea id="f-resumo" class="admin-input" rows="3" placeholder="Breve descrição do post (aparece na listagem)">${escHtml(post?.resumo ?? '')}</textarea>
      </div>

      <!-- Conteúdo (Quill) -->
      <div class="admin-form-group">
        <label class="admin-label">Conteúdo *</label>
        <div id="quill-editor"></div>
      </div>

      <!-- Publicado -->
      <div class="admin-form-group" style="display:flex;align-items:center;gap:0.75rem;">
        <input type="checkbox" id="f-publicado" ${post?.publicado ? 'checked' : ''} style="width:18px;height:18px;cursor:pointer;accent-color:var(--admin-verde);">
        <label for="f-publicado" class="admin-label" style="margin-bottom:0;cursor:pointer;">Publicado</label>
      </div>

      <!-- Ações -->
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap;padding-top:0.5rem;border-top:1px solid var(--admin-border);">
        <button class="admin-btn-primary" id="btn-salvar">Salvar</button>
        <button class="admin-btn-secondary" id="btn-preview">👁 Preview</button>
      </div>
    </div>
  `

  // Voltar
  document.getElementById('btn-voltar')?.addEventListener('click', showList)

  // Auto-slug ao digitar título (somente em posts novos)
  if (!postId) {
    document.getElementById('f-titulo')?.addEventListener('input', e => {
      const slugEl = document.getElementById('f-slug')
      if (slugEl) slugEl.value = toSlug(e.target.value)
    })
  }

  // Inicializar Quill
  quill = new Quill('#quill-editor', {
    theme: 'snow',
    modules: {
      toolbar: [
        [{ header: [2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean'],
      ],
    },
  })

  // Carregar conteúdo existente
  if (post?.conteudo) {
    quill.root.innerHTML = post.conteudo
  }

  // Upload de imagem de capa
  document.getElementById('f-imagem-file')?.addEventListener('change', async e => {
    const file = e.target.files?.[0]
    if (!file) return
    const status = document.getElementById('upload-status')
    if (status) status.textContent = 'Enviando…'

    const ext = file.name.split('.').pop()
    const path = `blog/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    const { error: uploadError } = await supabase.storage
      .from('pilar360')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      if (status) status.textContent = 'Erro no upload: ' + uploadError.message
      return
    }

    const { data: publicData } = supabase.storage.from('pilar360').getPublicUrl(path)
    const url = publicData?.publicUrl ?? ''

    const urlInput = document.getElementById('f-imagem-url')
    if (urlInput) urlInput.value = url
    if (status) status.textContent = 'Upload concluído!'
    setTimeout(() => { if (status) status.textContent = '' }, 3000)
  })

  // Salvar
  document.getElementById('btn-salvar')?.addEventListener('click', savePost)

  // Preview
  document.getElementById('btn-preview')?.addEventListener('click', openPreview)
}

// ─── SAVE ─────────────────────────────────────────────────────────────

async function savePost() {
  const titulo = document.getElementById('f-titulo')?.value.trim()
  const slug = document.getElementById('f-slug')?.value.trim()
  const categoria = document.getElementById('f-categoria')?.value
  const resumo = document.getElementById('f-resumo')?.value.trim()
  const imagem_capa_url = document.getElementById('f-imagem-url')?.value.trim() || null
  const publicado = document.getElementById('f-publicado')?.checked ?? false
  const conteudo = quill?.root.innerHTML ?? ''

  if (!titulo) { showToast('Título é obrigatório.', true); return }
  if (!slug) { showToast('Slug é obrigatório.', true); return }
  if (!categoria) { showToast('Categoria é obrigatória.', true); return }

  // Buscar publicado_em atual (se edição)
  let publicado_em = null
  if (currentPostId) {
    const { data: existing } = await supabase
      .from('blog_post')
      .select('publicado_em')
      .eq('id', currentPostId)
      .single()
    publicado_em = existing?.publicado_em ?? null
  }

  // Lógica de publicado_em
  if (publicado && !publicado_em) {
    // Publicando pela primeira vez
    publicado_em = new Date().toISOString()
  } else if (!publicado) {
    // Despublicando
    publicado_em = null
  }
  // Se já estava publicado e continua publicado, mantém publicado_em como está

  const payload = {
    titulo,
    slug,
    categoria,
    resumo: resumo || null,
    conteudo,
    imagem_capa_url,
    publicado,
    publicado_em,
  }

  let error
  if (currentPostId) {
    const result = await supabase.from('blog_post').update(payload).eq('id', currentPostId)
    error = result.error
  } else {
    const result = await supabase.from('blog_post').insert([payload])
    error = result.error
  }

  if (error) {
    showToast('Erro ao salvar: ' + error.message, true)
    console.error(error)
    return
  }

  showToast(currentPostId ? 'Post atualizado com sucesso!' : 'Post criado com sucesso!')
  setTimeout(() => showList(), 1000)
}

// ─── PREVIEW MODAL ────────────────────────────────────────────────────

function openPreview() {
  const titulo = document.getElementById('f-titulo')?.value.trim() || 'Sem título'
  const categoria = document.getElementById('f-categoria')?.value || ''
  const conteudo = quill?.root.innerHTML ?? ''
  const imagem = document.getElementById('f-imagem-url')?.value.trim() || ''

  const categoriaText = categoriaLabel[categoria] || categoria || ''

  // Remove modal existente
  document.getElementById('preview-modal')?.remove()

  const modal = document.createElement('div')
  modal.id = 'preview-modal'
  modal.style.cssText = `
    position:fixed;inset:0;z-index:9999;
    background:rgba(0,0,0,0.85);
    display:flex;align-items:flex-start;justify-content:center;
    overflow-y:auto;padding:2rem 1rem;
  `

  modal.innerHTML = `
    <div style="
      background:#0a0a0a;
      color:#fff;
      max-width:800px;
      width:100%;
      border-radius:12px;
      padding:2.5rem 2rem;
      position:relative;
      font-family:'DM Sans',sans-serif;
    ">
      <button id="btn-close-preview" style="
        position:absolute;top:1rem;right:1rem;
        background:rgba(255,255,255,0.1);
        border:none;color:#fff;
        font-size:1.25rem;cursor:pointer;
        width:36px;height:36px;border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        transition:background 0.2s;
      " aria-label="Fechar">×</button>

      ${categoriaText ? `
        <div style="
          display:inline-block;
          background:#1a3d2a;
          color:#4ade80;
          font-size:0.75rem;
          font-weight:700;
          letter-spacing:0.08em;
          text-transform:uppercase;
          padding:0.25rem 0.75rem;
          border-radius:4px;
          margin-bottom:1rem;
        ">${escHtml(categoriaText)}</div>
      ` : ''}

      <h1 style="
        font-family:'Bebas Neue',sans-serif;
        font-size:2.5rem;
        font-weight:400;
        line-height:1.15;
        margin:0 0 1.25rem;
        color:#fff;
        letter-spacing:0.02em;
      ">${escHtml(titulo)}</h1>

      ${imagem ? `
        <img src="${escHtml(imagem)}" alt="Capa" style="
          width:100%;max-height:400px;object-fit:cover;
          border-radius:8px;margin-bottom:1.5rem;
        " onerror="this.style.display='none'">
      ` : ''}

      <div class="preview-content" style="
        color:#d1d5db;
        font-size:1rem;
        line-height:1.85;
      ">${conteudo}</div>
    </div>
  `

  document.body.appendChild(modal)

  document.getElementById('btn-close-preview')?.addEventListener('click', () => modal.remove())
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove() })
}

// ─── INIT ─────────────────────────────────────────────────────────────

showList()
