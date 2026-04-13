import { requireAuth } from './auth.js'
import { supabase } from './supabase.js'
import { renderAdminLayout } from './admin-layout.js'

// Guard: redireciona para login se não autenticado
const session = await requireAuth()
if (!session) throw new Error('Not authenticated')

// Monta sidebar ao redor do conteúdo existente no div#admin-layout
renderAdminLayout('dashboard')

// Estado dos filtros
let currentFilter = 'all'

// ─── Stats ───────────────────────────────────────────────────────────
async function loadStats() {
  const statsGrid = document.getElementById('stats-grid')

  const [
    { count: unreadCount },
    { count: postsCount },
    { count: unidadesCount },
  ] = await Promise.all([
    supabase
      .from('contato_mensagem')
      .select('*', { count: 'exact', head: true })
      .eq('lido', false),
    supabase
      .from('blog_post')
      .select('*', { count: 'exact', head: true })
      .eq('publicado', true),
    supabase
      .from('projeto_unidade')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'disponivel'),
  ])

  if (!statsGrid) return

  statsGrid.innerHTML = `
    <div class="admin-stat-card">
      <div class="admin-stat-value">${unreadCount ?? 0}</div>
      <div class="admin-stat-label">Mensagens não lidas</div>
    </div>
    <div class="admin-stat-card">
      <div class="admin-stat-value">${postsCount ?? 0}</div>
      <div class="admin-stat-label">Posts publicados</div>
    </div>
    <div class="admin-stat-card">
      <div class="admin-stat-value">${unidadesCount ?? 0}</div>
      <div class="admin-stat-label">Unidades disponíveis</div>
    </div>
  `
}

// ─── Messages ────────────────────────────────────────────────────────
async function loadMessages(filter = 'all') {
  const list = document.getElementById('messages-list')
  if (!list) return

  list.innerHTML = `<div class="admin-empty"><div class="admin-empty-icon">⏳</div>Carregando…</div>`

  let query = supabase
    .from('contato_mensagem')
    .select('*')
    .order('created_at', { ascending: false })

  if (filter === 'unread') {
    query = query.eq('lido', false)
  }

  const { data: messages, error } = await query

  if (error) {
    list.innerHTML = `<div class="admin-empty"><div class="admin-empty-icon">⚠️</div>Erro ao carregar mensagens.</div>`
    console.error(error)
    return
  }

  if (!messages || messages.length === 0) {
    const emptyText = filter === 'unread' ? 'Nenhuma mensagem não lida.' : 'Nenhuma mensagem ainda.'
    list.innerHTML = `<div class="admin-empty"><div class="admin-empty-icon">✉️</div>${emptyText}</div>`
    return
  }

  list.innerHTML = messages.map(msg => renderMsgItem(msg)).join('')

  // Expandir/colapsar ao clicar no header
  list.querySelectorAll('.admin-msg-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.admin-msg-item')
      item.classList.toggle('open')
    })
  })

  // Marcar como lida
  list.querySelectorAll('.btn-mark-read').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      const id = btn.dataset.id
      btn.disabled = true
      btn.textContent = 'Marcando…'

      const { error: updateError } = await supabase
        .from('contato_mensagem')
        .update({ lido: true })
        .eq('id', id)

      if (updateError) {
        btn.disabled = false
        btn.textContent = 'Marcar como lida'
        console.error(updateError)
        return
      }

      // Recarrega mensagens e stats
      await Promise.all([loadMessages(currentFilter), loadStats()])
    })
  })
}

function renderMsgItem(msg) {
  const unread = !msg.lido
  const date = new Date(msg.created_at).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
  const preview = (msg.mensagem || '').slice(0, 80).replace(/\n/g, ' ')

  return `
    <div class="admin-msg-item ${unread ? 'unread' : ''}">
      <div class="admin-msg-header">
        <div class="admin-msg-header-left">
          <span class="admin-msg-badge"></span>
          <div style="min-width:0;">
            <div class="admin-msg-name">${escHtml(msg.nome || '—')}</div>
            <div class="admin-msg-preview">${escHtml(preview)}${(msg.mensagem || '').length > 80 ? '…' : ''}</div>
          </div>
        </div>
        <div class="admin-msg-meta">
          <span class="admin-msg-date">${date}</span>
          ${msg.perfil ? `<span class="admin-msg-perfil">${escHtml(msg.perfil)}</span>` : ''}
        </div>
        <span class="admin-msg-chevron">▼</span>
      </div>
      <div class="admin-msg-detail">
        <div class="admin-msg-detail-row">
          <span class="admin-msg-detail-label">Nome</span>
          <span class="admin-msg-detail-value">${escHtml(msg.nome || '—')}</span>
          <span class="admin-msg-detail-label">E-mail</span>
          <span class="admin-msg-detail-value">${msg.email ? `<a href="mailto:${escHtml(msg.email)}" style="color:var(--admin-verde)">${escHtml(msg.email)}</a>` : '—'}</span>
          <span class="admin-msg-detail-label">Telefone</span>
          <span class="admin-msg-detail-value">${escHtml(msg.telefone || '—')}</span>
          <span class="admin-msg-detail-label">Perfil</span>
          <span class="admin-msg-detail-value">${escHtml(msg.perfil || '—')}</span>
          <span class="admin-msg-detail-label">Status</span>
          <span class="admin-msg-detail-value">${unread ? '<strong style="color:var(--admin-verde)">Não lida</strong>' : 'Lida'}</span>
        </div>
        <div class="admin-msg-body">${escHtml(msg.mensagem || '—')}</div>
        <div class="admin-msg-actions">
          ${unread
            ? `<button class="admin-btn-primary btn-mark-read" data-id="${msg.id}" style="font-size:0.8rem;padding:0.5rem 1rem;">Marcar como lida</button>`
            : ''
          }
        </div>
      </div>
    </div>
  `
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ─── Filter Buttons ───────────────────────────────────────────────────
function initFilterBar() {
  const bar = document.getElementById('filter-bar')
  if (!bar) return

  bar.querySelectorAll('.admin-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      bar.querySelectorAll('.admin-filter-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      currentFilter = btn.dataset.filter
      loadMessages(currentFilter)
    })
  })
}

// ─── Init ─────────────────────────────────────────────────────────────
initFilterBar()
await Promise.all([loadStats(), loadMessages(currentFilter)])
