import { requireAuth } from './auth.js'
import { supabase } from './supabase.js'
import { renderAdminLayout } from './admin-layout.js'

// Guard: redireciona para login se não autenticado
const session = await requireAuth()
if (!session) throw new Error('Not authenticated')

// Monta sidebar ao redor do conteúdo existente no div#admin-layout
renderAdminLayout('projetos')

// Estado global
let currentProjetoId = null

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
  return document.getElementById('admin-projetos-content')
}

// ─── LIST VIEW ────────────────────────────────────────────────────────

async function showList() {
  currentProjetoId = null
  const cont = container()
  if (!cont) return

  cont.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;">
      <div>
        <h1 class="admin-page-title" style="margin-bottom:0.25rem;">Projetos</h1>
        <p class="admin-page-subtitle" style="margin-bottom:0;">Gerencie todos os empreendimentos</p>
      </div>
      <button class="admin-btn-primary" id="btn-novo-projeto">+ Novo Projeto</button>
    </div>
    <div id="toast-msg" class="admin-success"></div>
    <div id="projetos-table-wrap">
      <div class="admin-empty"><div class="admin-empty-icon">⏳</div>Carregando projetos…</div>
    </div>
  `

  document.getElementById('btn-novo-projeto')?.addEventListener('click', () => showForm(null))

  const { data: projetos, error } = await supabase
    .from('projeto')
    .select('id, nome, slug, status, total_unidades')
    .order('sort_order', { ascending: true })

  const wrap = document.getElementById('projetos-table-wrap')
  if (!wrap) return

  if (error) {
    wrap.innerHTML = `<div class="admin-empty"><div class="admin-empty-icon">⚠️</div>Erro ao carregar projetos.</div>`
    console.error(error)
    return
  }

  if (!projetos || projetos.length === 0) {
    wrap.innerHTML = `<div class="admin-empty"><div class="admin-empty-icon">🏗️</div>Nenhum projeto cadastrado ainda.</div>`
    return
  }

  const statusLabel = {
    'Em Construção': '<span style="color:#f59e0b;font-weight:600;">Em Construção</span>',
    'Em fase final': '<span style="color:#3b82f6;font-weight:600;">Em fase final</span>',
    'Entregue': '<span style="color:var(--admin-verde);font-weight:600;">Entregue</span>',
  }

  wrap.innerHTML = `
    <div style="background:var(--admin-card);border:1px solid var(--admin-border);border-radius:10px;overflow:hidden;">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Status</th>
            <th>Unidades</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${projetos.map(p => `
            <tr>
              <td>
                <div style="font-weight:600;color:var(--admin-text);">${escHtml(p.nome)}</div>
                <div style="font-size:0.75rem;color:var(--admin-muted);margin-top:0.15rem;">${escHtml(p.slug)}</div>
              </td>
              <td>${statusLabel[p.status] ?? escHtml(p.status ?? '—')}</td>
              <td>${p.total_unidades ?? '—'}</td>
              <td>
                <button class="admin-btn-secondary btn-edit-projeto" data-id="${p.id}"
                  style="font-size:0.8rem;padding:0.4rem 0.9rem;">Editar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `

  wrap.querySelectorAll('.btn-edit-projeto').forEach(btn => {
    btn.addEventListener('click', () => showForm(Number(btn.dataset.id)))
  })
}

// ─── EDIT FORM VIEW ───────────────────────────────────────────────────

async function showForm(projetoId) {
  currentProjetoId = projetoId
  const cont = container()
  if (!cont) return

  // Esqueleto inicial
  cont.innerHTML = `
    <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.5rem;">
      <button class="admin-btn-secondary" id="btn-back-list" style="font-size:0.8rem;padding:0.4rem 0.85rem;">← Voltar</button>
      <h1 class="admin-page-title" style="margin-bottom:0;">${projetoId ? 'Editar Projeto' : 'Novo Projeto'}</h1>
    </div>
    <div id="toast-msg" class="admin-success"></div>
    <div id="form-wrap">
      <div class="admin-empty"><div class="admin-empty-icon">⏳</div>Carregando…</div>
    </div>
  `

  document.getElementById('btn-back-list')?.addEventListener('click', showList)

  let projeto = null
  if (projetoId) {
    const { data, error } = await supabase
      .from('projeto')
      .select('*')
      .eq('id', projetoId)
      .single()
    if (error) {
      document.getElementById('form-wrap').innerHTML =
        `<div class="admin-empty"><div class="admin-empty-icon">⚠️</div>Erro ao carregar projeto.</div>`
      console.error(error)
      return
    }
    projeto = data
  }

  const v = projeto ?? {}

  const formWrap = document.getElementById('form-wrap')
  formWrap.innerHTML = `
    <div style="background:var(--admin-card);border:1px solid var(--admin-border);border-radius:10px;padding:2rem;margin-bottom:2rem;">
      <h2 class="admin-section-title" style="margin-bottom:1.25rem;">Dados do Projeto</h2>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
        <div class="admin-form-group">
          <label for="f-nome">Nome</label>
          <input type="text" id="f-nome" value="${escHtml(v.nome ?? '')}" placeholder="Nome do empreendimento">
        </div>
        <div class="admin-form-group">
          <label for="f-slug">Slug</label>
          <input type="text" id="f-slug" value="${escHtml(v.slug ?? '')}" placeholder="nome-do-empreendimento">
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
        <div class="admin-form-group">
          <label for="f-status">Status</label>
          <select id="f-status">
            <option value="Em Construção" ${v.status === 'Em Construção' ? 'selected' : ''}>Em Construção</option>
            <option value="Em fase final" ${v.status === 'Em fase final' ? 'selected' : ''}>Em fase final</option>
            <option value="Entregue" ${v.status === 'Entregue' ? 'selected' : ''}>Entregue</option>
          </select>
        </div>
        <div class="admin-form-group">
          <label for="f-localizacao">Localização</label>
          <input type="text" id="f-localizacao" value="${escHtml(v.localizacao ?? '')}" placeholder="Ex: Bairro, Cidade - UF">
        </div>
      </div>

      <div class="admin-form-group" style="margin-bottom:1rem;">
        <label for="f-descricao">Descrição</label>
        <textarea id="f-descricao" rows="4" placeholder="Descrição do empreendimento…">${escHtml(v.descricao ?? '')}</textarea>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;margin-bottom:1rem;">
        <div class="admin-form-group">
          <label for="f-tipologia">Tipologia</label>
          <input type="text" id="f-tipologia" value="${escHtml(v.tipologia ?? '')}" placeholder="Ex: 2 e 3 quartos">
        </div>
        <div class="admin-form-group">
          <label for="f-metragem">Metragem</label>
          <input type="text" id="f-metragem" value="${escHtml(v.metragem ?? '')}" placeholder="Ex: 65 a 90 m²">
        </div>
        <div class="admin-form-group">
          <label for="f-total-unidades">Total de Unidades</label>
          <input type="number" id="f-total-unidades" value="${v.total_unidades ?? ''}" placeholder="Ex: 120">
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;margin-bottom:1rem;">
        <div class="admin-form-group">
          <label for="f-data-entrega">Data de Entrega</label>
          <input type="text" id="f-data-entrega" value="${escHtml(v.data_entrega ?? '')}" placeholder="Ex: Dez/2026">
        </div>
        <div class="admin-form-group">
          <label for="f-valor-base">Valor Base (R$)</label>
          <input type="number" id="f-valor-base" value="${v.valor_base ?? ''}" placeholder="Ex: 350000">
        </div>
        <div class="admin-form-group">
          <label for="f-sort-order">Ordem de exibição</label>
          <input type="number" id="f-sort-order" value="${v.sort_order ?? 0}">
        </div>
      </div>

      <div class="admin-form-group" style="margin-bottom:1.5rem;">
        <label for="f-capa-url">Imagem de Capa (URL)</label>
        <div style="display:flex;gap:0.5rem;">
          <input type="text" id="f-capa-url" value="${escHtml(v.capa_url ?? '')}" placeholder="https://…" style="flex:1;">
          <label class="admin-btn-secondary" style="cursor:pointer;white-space:nowrap;">
            📎 Upload
            <input type="file" id="f-capa-file" accept="image/*" style="display:none;">
          </label>
        </div>
        <div id="capa-upload-status" style="font-size:0.78rem;color:var(--admin-muted);margin-top:0.35rem;"></div>
      </div>

      <div style="display:flex;gap:0.75rem;">
        <button class="admin-btn-primary" id="btn-save-projeto">
          ${projetoId ? 'Salvar Alterações' : 'Criar Projeto'}
        </button>
        ${projetoId ? `<button class="admin-btn-danger" id="btn-delete-projeto" style="margin-left:auto;">Excluir Projeto</button>` : ''}
      </div>
    </div>
    ${projetoId ? `<div id="subsections-wrap"></div>` : ''}
  `

  // Auto-slug para novo projeto
  if (!projetoId) {
    document.getElementById('f-nome')?.addEventListener('input', (e) => {
      const slugEl = document.getElementById('f-slug')
      if (slugEl) slugEl.value = toSlug(e.target.value)
    })
  }

  // Upload da capa
  document.getElementById('f-capa-file')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const statusEl = document.getElementById('capa-upload-status')
    statusEl.textContent = 'Enviando imagem…'
    const path = `projetos/capas/${Date.now()}-${file.name}`
    const { error: upErr } = await supabase.storage.from('pilar360').upload(path, file)
    if (upErr) {
      statusEl.textContent = `Erro: ${upErr.message}`
      return
    }
    const { data: urlData } = supabase.storage.from('pilar360').getPublicUrl(path)
    document.getElementById('f-capa-url').value = urlData.publicUrl
    statusEl.textContent = 'Upload concluído.'
  })

  // Salvar projeto
  document.getElementById('btn-save-projeto')?.addEventListener('click', () => saveProject(projetoId))

  // Excluir projeto
  document.getElementById('btn-delete-projeto')?.addEventListener('click', () => deleteProject(projetoId))

  // Carregar sub-seções (somente ao editar)
  if (projetoId) {
    renderSubsections(projetoId)
  }
}

// ─── SAVE PROJECT ─────────────────────────────────────────────────────

async function saveProject(projetoId) {
  const btn = document.getElementById('btn-save-projeto')
  if (btn) { btn.disabled = true; btn.textContent = 'Salvando…' }

  const payload = {
    nome: document.getElementById('f-nome')?.value?.trim() || null,
    slug: document.getElementById('f-slug')?.value?.trim() || null,
    status: document.getElementById('f-status')?.value || null,
    localizacao: document.getElementById('f-localizacao')?.value?.trim() || null,
    descricao: document.getElementById('f-descricao')?.value?.trim() || null,
    tipologia: document.getElementById('f-tipologia')?.value?.trim() || null,
    metragem: document.getElementById('f-metragem')?.value?.trim() || null,
    total_unidades: Number(document.getElementById('f-total-unidades')?.value) || null,
    data_entrega: document.getElementById('f-data-entrega')?.value?.trim() || null,
    valor_base: Number(document.getElementById('f-valor-base')?.value) || null,
    sort_order: Number(document.getElementById('f-sort-order')?.value) || 0,
    capa_url: document.getElementById('f-capa-url')?.value?.trim() || null,
  }

  if (!payload.nome) {
    showToast('O nome do projeto é obrigatório.', true)
    if (btn) { btn.disabled = false; btn.textContent = projetoId ? 'Salvar Alterações' : 'Criar Projeto' }
    return
  }

  let savedId = projetoId
  let dbError = null

  if (projetoId) {
    const { error } = await supabase.from('projeto').update(payload).eq('id', projetoId)
    dbError = error
  } else {
    const { data, error } = await supabase.from('projeto').insert(payload).select('id').single()
    dbError = error
    if (!error && data) savedId = data.id
  }

  if (dbError) {
    showToast(`Erro ao salvar: ${dbError.message}`, true)
    console.error(dbError)
    if (btn) { btn.disabled = false; btn.textContent = projetoId ? 'Salvar Alterações' : 'Criar Projeto' }
    return
  }

  showToast(projetoId ? 'Projeto atualizado com sucesso!' : 'Projeto criado com sucesso!')

  if (!projetoId && savedId) {
    // Redireciona para o form de edição com sub-seções
    await showForm(savedId)
  } else {
    if (btn) { btn.disabled = false; btn.textContent = 'Salvar Alterações' }
  }
}

// ─── DELETE PROJECT ───────────────────────────────────────────────────

async function deleteProject(projetoId) {
  if (!confirm('Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.')) return

  const { error } = await supabase.from('projeto').delete().eq('id', projetoId)
  if (error) {
    showToast(`Erro ao excluir: ${error.message}`, true)
    return
  }
  await showList()
}

// ─── SUB-SEÇÕES ───────────────────────────────────────────────────────

async function renderSubsections(projetoId) {
  const wrap = document.getElementById('subsections-wrap')
  if (!wrap) return

  wrap.innerHTML = `<div class="admin-empty"><div class="admin-empty-icon">⏳</div>Carregando seções…</div>`

  const [galeriaHtml, plantaHtml, unidadesHtml, updatesHtml] = await Promise.all([
    buildGaleriaSection(projetoId),
    buildPlantaSection(projetoId),
    buildUnidadesSection(projetoId),
    buildUpdatesSection(projetoId),
  ])

  wrap.innerHTML = galeriaHtml + plantaHtml + unidadesHtml + updatesHtml

  bindGaleriaEvents(projetoId)
  bindPlantaEvents(projetoId)
  bindUnidadesEvents(projetoId)
  bindUpdatesEvents(projetoId)
}

// ─── GALERIA ──────────────────────────────────────────────────────────

async function buildGaleriaSection(projetoId) {
  const { data: imagens } = await supabase
    .from('projeto_imagem')
    .select('id, image_url, sort_order')
    .eq('projeto_id', projetoId)
    .order('sort_order', { ascending: true })

  const thumbs = (imagens ?? []).map(img => `
    <div style="position:relative;display:inline-block;">
      <img src="${escHtml(img.image_url)}" alt=""
        style="width:110px;height:80px;object-fit:cover;border-radius:6px;border:1px solid var(--admin-border);">
      <button class="btn-del-galeria" data-id="${img.id}"
        style="position:absolute;top:4px;right:4px;background:rgba(239,68,68,0.9);color:#fff;
          border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;
          font-size:0.75rem;display:flex;align-items:center;justify-content:center;line-height:1;">✕</button>
    </div>
  `).join('')

  return `
    <div style="background:var(--admin-card);border:1px solid var(--admin-border);border-radius:10px;padding:2rem;margin-bottom:2rem;">
      <h2 class="admin-section-title" style="margin-bottom:1rem;">Galeria de Fotos</h2>
      <div id="galeria-thumbs" style="display:flex;flex-wrap:wrap;gap:0.75rem;margin-bottom:1rem;">
        ${thumbs || '<span style="color:var(--admin-muted);font-size:0.85rem;">Nenhuma imagem ainda.</span>'}
      </div>
      <label class="admin-btn-secondary" style="cursor:pointer;display:inline-flex;align-items:center;gap:0.4rem;">
        📎 Adicionar fotos
        <input type="file" id="galeria-file-input" accept="image/*" multiple style="display:none;">
      </label>
      <div id="galeria-upload-status" style="font-size:0.78rem;color:var(--admin-muted);margin-top:0.5rem;"></div>
    </div>
  `
}

function bindGaleriaEvents(projetoId) {
  document.getElementById('galeria-file-input')?.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const statusEl = document.getElementById('galeria-upload-status')
    statusEl.textContent = `Enviando ${files.length} imagem(ns)…`

    let uploaded = 0
    for (const file of files) {
      const path = `projetos/galeria/${projetoId}/${Date.now()}-${file.name}`
      const { error: upErr } = await supabase.storage.from('pilar360').upload(path, file)
      if (upErr) {
        statusEl.textContent = `Erro: ${upErr.message}`
        console.error(upErr)
        continue
      }
      const { data: urlData } = supabase.storage.from('pilar360').getPublicUrl(path)
      const { error: insertErr } = await supabase.from('projeto_imagem').insert({
        projeto_id: projetoId,
        image_url: urlData.publicUrl,
        sort_order: Date.now(),
      })
      if (insertErr) { console.error(insertErr); continue }
      uploaded++
    }

    statusEl.textContent = `${uploaded} imagem(ns) adicionada(s).`
    e.target.value = ''
    // Atualiza somente a galeria
    const galeriaSection = document.querySelector('#subsections-wrap > div:nth-child(1)')
    if (galeriaSection) {
      const { data: imagens } = await supabase
        .from('projeto_imagem')
        .select('id, image_url, sort_order')
        .eq('projeto_id', projetoId)
        .order('sort_order', { ascending: true })
      const thumbs = (imagens ?? []).map(img => `
        <div style="position:relative;display:inline-block;">
          <img src="${escHtml(img.image_url)}" alt=""
            style="width:110px;height:80px;object-fit:cover;border-radius:6px;border:1px solid var(--admin-border);">
          <button class="btn-del-galeria" data-id="${img.id}"
            style="position:absolute;top:4px;right:4px;background:rgba(239,68,68,0.9);color:#fff;
              border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;
              font-size:0.75rem;display:flex;align-items:center;justify-content:center;line-height:1;">✕</button>
        </div>
      `).join('')
      const thumbsEl = document.getElementById('galeria-thumbs')
      if (thumbsEl) {
        thumbsEl.innerHTML = thumbs || '<span style="color:var(--admin-muted);font-size:0.85rem;">Nenhuma imagem ainda.</span>'
        bindGaleriaDeleteBtns(projetoId)
      }
    }
  })

  bindGaleriaDeleteBtns(projetoId)
}

function bindGaleriaDeleteBtns(projetoId) {
  document.querySelectorAll('.btn-del-galeria').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Remover esta imagem da galeria?')) return
      const imgId = btn.dataset.id
      const { error } = await supabase.from('projeto_imagem').delete().eq('id', imgId)
      if (error) { showToast(`Erro: ${error.message}`, true); return }
      btn.closest('div')?.remove()
    })
  })
}

// ─── PLANTA BAIXA ─────────────────────────────────────────────────────

async function buildPlantaSection(projetoId) {
  const { data: p } = await supabase
    .from('projeto')
    .select('planta_url')
    .eq('id', projetoId)
    .single()

  const plantaUrl = p?.planta_url

  return `
    <div style="background:var(--admin-card);border:1px solid var(--admin-border);border-radius:10px;padding:2rem;margin-bottom:2rem;">
      <h2 class="admin-section-title" style="margin-bottom:1rem;">Planta Baixa</h2>
      <div id="planta-preview" style="margin-bottom:1rem;">
        ${plantaUrl
          ? `<img src="${escHtml(plantaUrl)}" alt="Planta baixa"
              style="max-width:300px;max-height:200px;object-fit:contain;border-radius:6px;border:1px solid var(--admin-border);">`
          : '<span style="color:var(--admin-muted);font-size:0.85rem;">Nenhuma planta cadastrada.</span>'
        }
      </div>
      <label class="admin-btn-secondary" style="cursor:pointer;display:inline-flex;align-items:center;gap:0.4rem;">
        📎 ${plantaUrl ? 'Substituir planta' : 'Enviar planta'}
        <input type="file" id="planta-file-input" accept="image/*" style="display:none;">
      </label>
      <div id="planta-upload-status" style="font-size:0.78rem;color:var(--admin-muted);margin-top:0.5rem;"></div>
    </div>
  `
}

function bindPlantaEvents(projetoId) {
  document.getElementById('planta-file-input')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const statusEl = document.getElementById('planta-upload-status')
    statusEl.textContent = 'Enviando planta…'

    const path = `plantas/${projetoId}/${Date.now()}-${file.name}`
    const { error: upErr } = await supabase.storage.from('pilar360').upload(path, file)
    if (upErr) {
      statusEl.textContent = `Erro: ${upErr.message}`
      return
    }
    const { data: urlData } = supabase.storage.from('pilar360').getPublicUrl(path)
    const { error: updateErr } = await supabase
      .from('projeto')
      .update({ planta_url: urlData.publicUrl })
      .eq('id', projetoId)

    if (updateErr) {
      statusEl.textContent = `Erro ao salvar: ${updateErr.message}`
      return
    }

    statusEl.textContent = 'Planta atualizada.'
    const preview = document.getElementById('planta-preview')
    if (preview) {
      preview.innerHTML = `<img src="${escHtml(urlData.publicUrl)}" alt="Planta baixa"
        style="max-width:300px;max-height:200px;object-fit:contain;border-radius:6px;border:1px solid var(--admin-border);">`
    }
    e.target.value = ''
  })
}

// ─── UNIDADES ─────────────────────────────────────────────────────────

async function buildUnidadesSection(projetoId) {
  const { data: unidades } = await supabase
    .from('projeto_unidade')
    .select('*')
    .eq('projeto_id', projetoId)
    .order('id', { ascending: true })

  const rows = (unidades ?? []).map(u => renderUnidadeRow(u)).join('')

  return `
    <div style="background:var(--admin-card);border:1px solid var(--admin-border);border-radius:10px;padding:2rem;margin-bottom:2rem;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
        <h2 class="admin-section-title" style="margin-bottom:0;">Unidades</h2>
        <button class="admin-btn-primary" id="btn-add-unidade" style="font-size:0.8rem;padding:0.45rem 1rem;">+ Adicionar</button>
      </div>
      <div style="overflow-x:auto;">
        <table class="admin-table" id="unidades-table">
          <thead>
            <tr>
              <th>Unidade</th>
              <th>Tipologia</th>
              <th>m²</th>
              <th>Andar</th>
              <th>Valor (R$)</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="unidades-tbody">
            ${rows}
          </tbody>
        </table>
      </div>
    </div>
  `
}

function renderUnidadeRow(u, isNew = false) {
  const statusOpts = ['disponivel', 'reservada', 'vendida']
  return `
    <tr data-unidade-id="${u.id ?? ''}">
      <td><input type="text" class="u-identificador" value="${escHtml(u.identificador ?? '')}"
        style="width:90px;padding:0.35rem 0.5rem;border:1px solid var(--admin-border);border-radius:4px;font-size:0.82rem;"></td>
      <td><input type="text" class="u-tipologia" value="${escHtml(u.tipologia ?? '')}"
        style="width:100px;padding:0.35rem 0.5rem;border:1px solid var(--admin-border);border-radius:4px;font-size:0.82rem;"></td>
      <td><input type="number" class="u-metragem" value="${u.metragem ?? ''}"
        style="width:70px;padding:0.35rem 0.5rem;border:1px solid var(--admin-border);border-radius:4px;font-size:0.82rem;"></td>
      <td><input type="text" class="u-andar" value="${escHtml(u.andar ?? '')}"
        style="width:70px;padding:0.35rem 0.5rem;border:1px solid var(--admin-border);border-radius:4px;font-size:0.82rem;"></td>
      <td><input type="number" class="u-valor" value="${u.valor ?? ''}"
        style="width:110px;padding:0.35rem 0.5rem;border:1px solid var(--admin-border);border-radius:4px;font-size:0.82rem;"></td>
      <td>
        <select class="u-status"
          style="padding:0.35rem 0.5rem;border:1px solid var(--admin-border);border-radius:4px;font-size:0.82rem;background:#fafafa;">
          ${statusOpts.map(s => `<option value="${s}" ${u.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
      <td style="white-space:nowrap;">
        <button class="admin-btn-primary btn-save-unidade" style="font-size:0.75rem;padding:0.35rem 0.7rem;">Salvar</button>
        <button class="admin-btn-danger btn-del-unidade" style="font-size:0.75rem;padding:0.35rem 0.7rem;margin-left:0.25rem;">✕</button>
      </td>
    </tr>
  `
}

function bindUnidadesEvents(projetoId) {
  document.getElementById('btn-add-unidade')?.addEventListener('click', () => {
    const tbody = document.getElementById('unidades-tbody')
    if (!tbody) return
    const newRow = document.createElement('tr')
    newRow.dataset.unidadeId = ''
    newRow.innerHTML = renderUnidadeRow({ identificador: 'Nova Unidade', tipologia: '', metragem: '', andar: '', valor: '', status: 'disponivel' }).match(/<tr[^>]*>([\s\S]*)<\/tr>/)?.[1] ?? ''

    // Rebuild properly
    const tmp = document.createElement('tbody')
    tmp.innerHTML = renderUnidadeRow({ identificador: 'Nova Unidade', tipologia: '', metragem: '', andar: '', valor: '', status: 'disponivel' })
    const newTr = tmp.querySelector('tr')
    if (newTr) {
      tbody.appendChild(newTr)
      bindUnidadeRowEvents(newTr, projetoId)
    }
  })

  document.querySelectorAll('#unidades-tbody tr').forEach(tr => {
    bindUnidadeRowEvents(tr, projetoId)
  })
}

function bindUnidadeRowEvents(tr, projetoId) {
  tr.querySelector('.btn-save-unidade')?.addEventListener('click', async () => {
    const btn = tr.querySelector('.btn-save-unidade')
    const unidadeId = tr.dataset.unidadeId
    const payload = {
      projeto_id: projetoId,
      identificador: tr.querySelector('.u-identificador')?.value?.trim() || null,
      tipologia: tr.querySelector('.u-tipologia')?.value?.trim() || null,
      metragem: Number(tr.querySelector('.u-metragem')?.value) || null,
      andar: tr.querySelector('.u-andar')?.value?.trim() || null,
      valor: Number(tr.querySelector('.u-valor')?.value) || null,
      status: tr.querySelector('.u-status')?.value || 'disponivel',
    }

    btn.disabled = true
    btn.textContent = '…'

    if (unidadeId) {
      const { error } = await supabase.from('projeto_unidade').update(payload).eq('id', unidadeId)
      if (error) { showToast(`Erro: ${error.message}`, true); btn.disabled = false; btn.textContent = 'Salvar'; return }
    } else {
      const { data, error } = await supabase.from('projeto_unidade').insert(payload).select('id').single()
      if (error) { showToast(`Erro: ${error.message}`, true); btn.disabled = false; btn.textContent = 'Salvar'; return }
      tr.dataset.unidadeId = data.id
    }

    btn.disabled = false
    btn.textContent = 'Salvar'
    showToast('Unidade salva.')
  })

  tr.querySelector('.btn-del-unidade')?.addEventListener('click', async () => {
    const unidadeId = tr.dataset.unidadeId
    if (unidadeId) {
      if (!confirm('Excluir esta unidade?')) return
      const { error } = await supabase.from('projeto_unidade').delete().eq('id', unidadeId)
      if (error) { showToast(`Erro: ${error.message}`, true); return }
    }
    tr.remove()
  })
}

// ─── UPDATES DE OBRA ──────────────────────────────────────────────────

async function buildUpdatesSection(projetoId) {
  const { data: updates } = await supabase
    .from('projeto_update')
    .select('*')
    .eq('projeto_id', projetoId)
    .order('data', { ascending: false })

  const items = (updates ?? []).map(u => {
    const date = u.data
      ? new Date(u.data + 'T00:00:00').toLocaleDateString('pt-BR')
      : '—'
    const preview = (u.descricao ?? '').slice(0, 80)
    return `
      <div class="update-item" data-update-id="${u.id}"
        style="border:1px solid var(--admin-border);border-radius:8px;padding:1rem;margin-bottom:0.75rem;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;">
          <div style="flex:1;min-width:0;">
            <div style="font-weight:600;font-size:0.9rem;margin-bottom:0.15rem;">${escHtml(u.titulo ?? '—')}</div>
            <div style="font-size:0.78rem;color:var(--admin-muted);margin-bottom:0.25rem;">${date}</div>
            <div style="font-size:0.82rem;color:var(--admin-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(preview)}${(u.descricao ?? '').length > 80 ? '…' : ''}</div>
          </div>
          ${u.foto_url ? `<img src="${escHtml(u.foto_url)}" alt="" style="width:60px;height:45px;object-fit:cover;border-radius:4px;border:1px solid var(--admin-border);flex-shrink:0;">` : ''}
          <button class="btn-del-update" data-id="${u.id}"
            style="background:var(--admin-danger);color:#fff;border:none;border-radius:4px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.78rem;flex-shrink:0;">✕</button>
        </div>
      </div>
    `
  }).join('')

  return `
    <div style="background:var(--admin-card);border:1px solid var(--admin-border);border-radius:10px;padding:2rem;margin-bottom:2rem;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
        <h2 class="admin-section-title" style="margin-bottom:0;">Updates de Obra</h2>
        <button class="admin-btn-primary" id="btn-toggle-add-update" style="font-size:0.8rem;padding:0.45rem 1rem;">+ Adicionar</button>
      </div>

      <div id="add-update-form" style="display:none;border:1px solid var(--admin-border);border-radius:8px;padding:1.25rem;margin-bottom:1.25rem;background:#fafafa;">
        <h3 style="font-size:0.9rem;font-weight:600;margin-bottom:1rem;">Novo Update</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
          <div class="admin-form-group">
            <label>Título</label>
            <input type="text" id="nu-titulo" placeholder="Ex: Estrutura do 5º andar concluída">
          </div>
          <div class="admin-form-group">
            <label>Data</label>
            <input type="date" id="nu-data">
          </div>
        </div>
        <div class="admin-form-group" style="margin-bottom:1rem;">
          <label>Descrição</label>
          <textarea id="nu-descricao" rows="3" placeholder="Detalhes do update…"></textarea>
        </div>
        <div class="admin-form-group" style="margin-bottom:1rem;">
          <label>Foto (opcional)</label>
          <label class="admin-btn-secondary" style="cursor:pointer;display:inline-flex;align-items:center;gap:0.4rem;">
            📎 Upload foto
            <input type="file" id="nu-foto-file" accept="image/*" style="display:none;">
          </label>
          <div id="nu-foto-preview" style="margin-top:0.5rem;"></div>
          <input type="hidden" id="nu-foto-url">
        </div>
        <div id="nu-foto-status" style="font-size:0.78rem;color:var(--admin-muted);margin-bottom:0.75rem;"></div>
        <div style="display:flex;gap:0.5rem;">
          <button class="admin-btn-primary" id="btn-save-update">Salvar Update</button>
          <button class="admin-btn-secondary" id="btn-cancel-update">Cancelar</button>
        </div>
      </div>

      <div id="updates-list">
        ${items || '<div class="admin-empty" style="padding:1.5rem;"><div class="admin-empty-icon">📋</div>Nenhum update cadastrado.</div>'}
      </div>
    </div>
  `
}

function bindUpdatesEvents(projetoId) {
  // Toggle form
  document.getElementById('btn-toggle-add-update')?.addEventListener('click', () => {
    const form = document.getElementById('add-update-form')
    if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none'
  })

  document.getElementById('btn-cancel-update')?.addEventListener('click', () => {
    const form = document.getElementById('add-update-form')
    if (form) form.style.display = 'none'
    resetUpdateForm()
  })

  // Foto upload
  document.getElementById('nu-foto-file')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const statusEl = document.getElementById('nu-foto-status')
    statusEl.textContent = 'Enviando foto…'

    const path = `projetos/updates/${projetoId}/${Date.now()}-${file.name}`
    const { error: upErr } = await supabase.storage.from('pilar360').upload(path, file)
    if (upErr) {
      statusEl.textContent = `Erro: ${upErr.message}`
      return
    }
    const { data: urlData } = supabase.storage.from('pilar360').getPublicUrl(path)
    document.getElementById('nu-foto-url').value = urlData.publicUrl
    const preview = document.getElementById('nu-foto-preview')
    if (preview) {
      preview.innerHTML = `<img src="${escHtml(urlData.publicUrl)}" alt=""
        style="width:120px;height:80px;object-fit:cover;border-radius:4px;border:1px solid var(--admin-border);">`
    }
    statusEl.textContent = 'Foto enviada.'
  })

  // Salvar update
  document.getElementById('btn-save-update')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-save-update')
    const titulo = document.getElementById('nu-titulo')?.value?.trim()
    const data = document.getElementById('nu-data')?.value
    const descricao = document.getElementById('nu-descricao')?.value?.trim()
    const foto_url = document.getElementById('nu-foto-url')?.value?.trim() || null

    if (!titulo) { showToast('O título é obrigatório.', true); return }

    btn.disabled = true
    btn.textContent = 'Salvando…'

    const { error } = await supabase.from('projeto_update').insert({
      projeto_id: projetoId,
      titulo,
      data: data || null,
      descricao: descricao || null,
      foto_url,
    })

    if (error) {
      showToast(`Erro: ${error.message}`, true)
      btn.disabled = false
      btn.textContent = 'Salvar Update'
      return
    }

    showToast('Update adicionado.')
    btn.disabled = false
    btn.textContent = 'Salvar Update'

    // Recarrega a lista de updates
    const { data: updates } = await supabase
      .from('projeto_update')
      .select('*')
      .eq('projeto_id', projetoId)
      .order('data', { ascending: false })

    const listEl = document.getElementById('updates-list')
    if (listEl) {
      const items = (updates ?? []).map(u => {
        const date = u.data
          ? new Date(u.data + 'T00:00:00').toLocaleDateString('pt-BR')
          : '—'
        const preview = (u.descricao ?? '').slice(0, 80)
        return `
          <div class="update-item" data-update-id="${u.id}"
            style="border:1px solid var(--admin-border);border-radius:8px;padding:1rem;margin-bottom:0.75rem;">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;">
              <div style="flex:1;min-width:0;">
                <div style="font-weight:600;font-size:0.9rem;margin-bottom:0.15rem;">${escHtml(u.titulo ?? '—')}</div>
                <div style="font-size:0.78rem;color:var(--admin-muted);margin-bottom:0.25rem;">${date}</div>
                <div style="font-size:0.82rem;color:var(--admin-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(preview)}${(u.descricao ?? '').length > 80 ? '…' : ''}</div>
              </div>
              ${u.foto_url ? `<img src="${escHtml(u.foto_url)}" alt="" style="width:60px;height:45px;object-fit:cover;border-radius:4px;border:1px solid var(--admin-border);flex-shrink:0;">` : ''}
              <button class="btn-del-update" data-id="${u.id}"
                style="background:var(--admin-danger);color:#fff;border:none;border-radius:4px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.78rem;flex-shrink:0;">✕</button>
            </div>
          </div>
        `
      }).join('')
      listEl.innerHTML = items || '<div class="admin-empty" style="padding:1.5rem;"><div class="admin-empty-icon">📋</div>Nenhum update cadastrado.</div>'
      bindUpdateDeleteBtns()
    }

    // Fechar form e resetar
    const form = document.getElementById('add-update-form')
    if (form) form.style.display = 'none'
    resetUpdateForm()
  })

  bindUpdateDeleteBtns()
}

function resetUpdateForm() {
  const ids = ['nu-titulo', 'nu-descricao', 'nu-foto-url']
  ids.forEach(id => {
    const el = document.getElementById(id)
    if (el) el.value = ''
  })
  const dataEl = document.getElementById('nu-data')
  if (dataEl) dataEl.value = ''
  const preview = document.getElementById('nu-foto-preview')
  if (preview) preview.innerHTML = ''
  const status = document.getElementById('nu-foto-status')
  if (status) status.textContent = ''
  const fileInput = document.getElementById('nu-foto-file')
  if (fileInput) fileInput.value = ''
}

function bindUpdateDeleteBtns() {
  document.querySelectorAll('.btn-del-update').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Excluir este update?')) return
      const id = btn.dataset.id
      const { error } = await supabase.from('projeto_update').delete().eq('id', id)
      if (error) { showToast(`Erro: ${error.message}`, true); return }
      btn.closest('.update-item')?.remove()
    })
  })
}

// ─── Init ─────────────────────────────────────────────────────────────
showList()
