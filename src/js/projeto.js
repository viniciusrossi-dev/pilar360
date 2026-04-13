import { supabase } from './supabase.js'
import { renderHeader } from './header.js'
import { renderFooter } from './footer.js'

const WA_NUMBER = '5551992143280'

renderHeader()
renderFooter()

// ─── Helpers ───────────────────────────────────────────────────────────────

function getSlug() {
  const params = new URLSearchParams(window.location.search)
  return params.get('id')
}

function formatMoeda(valor) {
  if (!valor && valor !== 0) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(valor)
}

function formatMoedaDecimal(valor) {
  if (!valor && valor !== 0) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(valor)
}

function formatData(str) {
  if (!str) return ''
  const d = new Date(str + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

// Price formula (tabela Price / SAC simplificado → parcela constante)
function calcParcelaPrice(pv, taxaAnual, meses) {
  if (pv <= 0) return 0
  const i = taxaAnual / 12 / 100
  if (i === 0) return pv / meses
  return pv * (i * Math.pow(1 + i, meses)) / (Math.pow(1 + i, meses) - 1)
}

// ─── Lightbox ──────────────────────────────────────────────────────────────

function initLightbox() {
  let overlay = document.getElementById('lightbox-overlay')
  if (!overlay) {
    overlay = document.createElement('div')
    overlay.id = 'lightbox-overlay'
    overlay.className = 'lightbox-overlay'
    overlay.innerHTML = `
      <button class="lightbox-close" aria-label="Fechar">&times;</button>
      <img class="lightbox-img" src="" alt="Imagem ampliada">
    `
    document.body.appendChild(overlay)
  }

  const img = overlay.querySelector('.lightbox-img')

  function openLightbox(src, alt) {
    img.src = src
    img.alt = alt || ''
    overlay.classList.add('active')
    document.body.style.overflow = 'hidden'
  }

  function closeLightbox() {
    overlay.classList.remove('active')
    document.body.style.overflow = ''
    setTimeout(() => { img.src = '' }, 300)
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.classList.contains('lightbox-close')) {
      closeLightbox()
    }
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox()
  })

  // Delegate: any element with data-lightbox
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-lightbox]')
    if (el) {
      e.preventDefault()
      openLightbox(el.dataset.lightbox, el.dataset.lightboxAlt)
    }
  })
}

// ─── Fade-in observer ──────────────────────────────────────────────────────

function initFadeObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el))
}

// ─── Simulator ─────────────────────────────────────────────────────────────

function initSimulator(projeto) {
  const form = document.getElementById('simulador-form')
  if (!form) return

  const inputRenda = document.getElementById('sim-renda')
  const inputValor = document.getElementById('sim-valor')
  const btnSimular = document.getElementById('sim-btn')
  const resultDiv = document.getElementById('sim-resultado')

  if (inputValor && projeto.valor_base) {
    inputValor.value = formatMoedaDecimal(projeto.valor_base).replace('R$\u00a0', '').replace('R$ ', '')
  }

  function parseBRL(str) {
    if (!str) return 0
    return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0
  }

  function getFaixa(renda) {
    if (renda <= 2640) return { nome: 'Faixa 1', subsidioMax: 55000, subsidioPerc: 0.5, juros: 4 }
    if (renda <= 4400) return { nome: 'Faixa 2', subsidioMax: 35000, subsidioPerc: 0.25, juros: 5.5 }
    if (renda <= 8000) return { nome: 'Faixa 3', subsidioMax: 0, subsidioPerc: 0, juros: 7.5 }
    return { nome: 'Acima do limite', subsidioMax: 0, subsidioPerc: 0, juros: 9 }
  }

  btnSimular.addEventListener('click', () => {
    const renda = parseBRL(inputRenda.value)
    const valor = parseBRL(inputValor.value)

    if (!renda || !valor) {
      resultDiv.innerHTML = '<p style="color:#ef4444;font-size:0.85rem;">Preencha a renda familiar e o valor do imóvel.</p>'
      return
    }

    const faixa = getFaixa(renda)
    const subsidio = Math.min(valor * faixa.subsidioPerc, faixa.subsidioMax)
    const financiado = Math.max(valor - subsidio, 0)
    const entrada = financiado * 0.2
    const financiadoLiq = financiado - entrada
    const parcela = calcParcelaPrice(financiadoLiq, faixa.juros, 420)
    const pctRenda = renda > 0 ? (parcela / renda * 100).toFixed(1) : '—'

    const waMsg = encodeURIComponent(
      `Olá! Tenho interesse no ${projeto.nome}.\n` +
      `Renda familiar: ${formatMoedaDecimal(renda)}\n` +
      `Enquadramento: ${faixa.nome}\n` +
      `Valor do imóvel: ${formatMoeda(valor)}\n` +
      `Subsídio estimado: ${formatMoeda(subsidio)}\n` +
      `Parcela estimada: ${formatMoedaDecimal(parcela)}/mês\n` +
      `Gostaria de saber mais.`
    )

    resultDiv.innerHTML = `
      <div class="sim-grid fade-in">
        <div class="sim-card">
          <div class="sim-card-label">Enquadramento</div>
          <div class="sim-card-val">${faixa.nome}</div>
        </div>
        <div class="sim-card">
          <div class="sim-card-label">Subsídio estimado</div>
          <div class="sim-card-val">${formatMoeda(subsidio)}</div>
        </div>
        <div class="sim-card">
          <div class="sim-card-label">Entrada (20%)</div>
          <div class="sim-card-val">${formatMoeda(entrada)}</div>
        </div>
        <div class="sim-card sim-card--destaque">
          <div class="sim-card-label">Parcela estimada</div>
          <div class="sim-card-val sim-val--destaque">${formatMoedaDecimal(parcela)}<span>/mês</span></div>
          <div class="sim-card-sub">${pctRenda}% da renda · ${faixa.juros}% a.a. · 420 meses</div>
        </div>
      </div>
      <div style="margin-top:1.5rem;">
        <a
          href="https://wa.me/${WA_NUMBER}?text=${waMsg}"
          target="_blank"
          rel="noopener"
          class="btn-primary sim-wa-btn"
        >Falar com um consultor</a>
        <p class="sim-disclaimer">* Simulação estimada. Subsídio, taxas e prazos sujeitos à aprovação da Caixa Econômica Federal.</p>
      </div>
    `
    setTimeout(initFadeObserver, 50)
  })
}

// ─── Render sections ───────────────────────────────────────────────────────

function renderHero(projeto) {
  const imgStyle = projeto.imagem_capa
    ? `background-image: url('${projeto.imagem_capa}')`
    : `background: var(--cinza-escuro)`

  return `
    <section class="projeto-hero fade-in" style="${imgStyle}">
      <div class="projeto-hero-overlay"></div>
      <div class="projeto-hero-content">
        ${projeto.status ? `<span class="projeto-status-badge">${projeto.status}</span>` : ''}
        <h1 class="projeto-hero-title">${projeto.nome || 'Projeto'}</h1>
        ${projeto.localizacao ? `<div class="projeto-hero-local">${projeto.localizacao}</div>` : ''}
      </div>
    </section>
  `
}

function renderSpecsBar(projeto) {
  const specs = [
    { label: 'Unidades', valor: projeto.total_unidades ?? '—' },
    { label: 'Metragem', valor: projeto.metragem_range || '—' },
    { label: 'Entrega', valor: projeto.previsao_entrega ? formatData(projeto.previsao_entrega) : '—' },
    { label: 'Valor Base', valor: projeto.valor_base ? formatMoeda(projeto.valor_base) : '—' },
  ]
  return `
    <div class="projeto-specs-bar fade-in">
      ${specs.map(s => `
        <div class="projeto-specs-item">
          <span class="projeto-specs-val">${s.valor}</span>
          <span class="projeto-specs-label">${s.label}</span>
        </div>
      `).join('')}
    </div>
  `
}

function renderDescricaoGaleria(projeto, imagens) {
  const galeriaItems = imagens.length
    ? imagens.map(img => `
        <div
          class="galeria-item"
          data-lightbox="${img.url}"
          data-lightbox-alt="${img.legenda || projeto.nome}"
          role="button"
          tabindex="0"
          aria-label="Ampliar imagem${img.legenda ? ': ' + img.legenda : ''}"
        >
          <img src="${img.url}" alt="${img.legenda || projeto.nome}" loading="lazy">
          ${img.legenda ? `<div class="galeria-item-legend">${img.legenda}</div>` : ''}
        </div>
      `).join('')
    : '<p style="color:var(--branco-suave);font-size:0.85rem;">Galeria em breve.</p>'

  return `
    <section class="projeto-descricao-section fade-in">
      <div class="projeto-descricao-grid">
        <div class="projeto-descricao">
          <span class="section-label">Sobre o projeto</span>
          <h2 class="section-title">${projeto.nome}</h2>
          <p class="section-text">${projeto.descricao || 'Descrição em breve.'}</p>
          ${projeto.diferenciais ? `
            <ul class="projeto-diferenciais">
              ${projeto.diferenciais.map(d => `<li>${d}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
        <div class="projeto-galeria">
          ${galeriaItems}
        </div>
      </div>
    </section>
  `
}

function renderPlanta(projeto) {
  if (!projeto.imagem_planta) return ''
  return `
    <section class="projeto-planta-section fade-in">
      <span class="section-label">Planta</span>
      <h2 class="section-title">Planta do Imóvel</h2>
      <div class="projeto-planta-wrapper">
        <img
          src="${projeto.imagem_planta}"
          alt="Planta ${projeto.nome}"
          class="projeto-planta-img"
          data-lightbox="${projeto.imagem_planta}"
          data-lightbox-alt="Planta ${projeto.nome}"
          role="button"
          tabindex="0"
        >
        <p class="projeto-planta-hint">Clique na imagem para ampliar</p>
      </div>
    </section>
  `
}

function renderUnidades(unidades) {
  if (!unidades || !unidades.length) return ''

  const statusLabel = { disponivel: 'Disponível', reservada: 'Reservada', vendida: 'Vendida' }
  const statusClass = { disponivel: 'status-disponivel', reservada: 'status-reservada', vendida: 'status-vendida' }

  return `
    <section class="projeto-unidades-section fade-in">
      <span class="section-label">Disponibilidade</span>
      <h2 class="section-title">Tabela de Unidades</h2>
      <div class="unidades-table-wrapper">
        <table class="unidades-table">
          <thead>
            <tr>
              <th>Unidade</th>
              <th>Tipologia</th>
              <th>Metragem</th>
              <th>Andar</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${unidades.map(u => `
              <tr>
                <td>${u.nome || '—'}</td>
                <td>${u.tipologia || '—'}</td>
                <td>${u.metragem ? u.metragem + 'm²' : '—'}</td>
                <td>${u.andar ?? '—'}</td>
                <td>${u.valor ? formatMoeda(u.valor) : '—'}</td>
                <td>
                  <span class="unidade-status ${statusClass[u.status] || ''}">
                    ${statusLabel[u.status] || u.status || '—'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `
}

function renderSimulador(projeto) {
  return `
    <section class="projeto-simulador-section fade-in">
      <span class="section-label">Financiamento</span>
      <h2 class="section-title">Simulador MCMV</h2>
      <p class="section-text">Descubra seu enquadramento e estime sua parcela mensal no programa Minha Casa Minha Vida.</p>
      <form class="simulador-form" id="simulador-form" onsubmit="return false;">
        <div class="form-group">
          <label for="sim-renda">Renda familiar bruta</label>
          <input
            type="text"
            id="sim-renda"
            placeholder="Ex: 3.500,00"
            inputmode="decimal"
          >
        </div>
        <div class="form-group">
          <label for="sim-valor">Valor do imóvel</label>
          <input
            type="text"
            id="sim-valor"
            placeholder="Ex: 150.000,00"
            inputmode="decimal"
          >
        </div>
        <div class="sim-btn-wrapper">
          <button type="button" class="btn-primary" id="sim-btn">Simular</button>
        </div>
      </form>
      <div id="sim-resultado"></div>
    </section>
  `
}

function renderTimeline(updates) {
  if (!updates || !updates.length) return ''

  // Sort most recent first
  const sorted = [...updates].sort((a, b) => new Date(b.data) - new Date(a.data))

  return `
    <section class="projeto-timeline-section fade-in">
      <span class="section-label">Obra</span>
      <h2 class="section-title">Atualizações</h2>
      <div class="timeline">
        ${sorted.map((item, i) => `
          <div class="timeline-item fade-in">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-data">${formatData(item.data)}</div>
              <div class="timeline-titulo">${item.titulo || ''}</div>
              ${item.descricao ? `<p class="timeline-desc">${item.descricao}</p>` : ''}
              ${item.foto_url ? `
                <div
                  class="timeline-foto"
                  data-lightbox="${item.foto_url}"
                  data-lightbox-alt="${item.titulo || 'Atualização de obra'}"
                  role="button"
                  tabindex="0"
                >
                  <img src="${item.foto_url}" alt="${item.titulo || 'Atualização'}" loading="lazy">
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `
}

function renderCTA(projeto) {
  const waMsg = encodeURIComponent(`Olá! Tenho interesse no ${projeto.nome}. Gostaria de mais informações.`)
  return `
    <section class="projeto-cta fade-in">
      <div class="projeto-cta-inner">
        <h2 class="projeto-cta-title">Gostou? Entre em contato.</h2>
        <p class="projeto-cta-sub">Nossa equipe está pronta para tirar suas dúvidas e ajudar você a conquistar seu imóvel.</p>
        <div class="projeto-cta-btns">
          <a
            href="https://wa.me/${WA_NUMBER}?text=${waMsg}"
            target="_blank"
            rel="noopener"
            class="btn-primary"
          >WhatsApp</a>
          <a href="/#contato" class="btn-outline">Formulário de contato</a>
        </div>
      </div>
    </section>
  `
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function init() {
  const slug = getSlug()
  if (!slug) {
    window.location.href = '/'
    return
  }

  const main = document.getElementById('projeto-content')

  // Load project
  const { data: projeto, error: projError } = await supabase
    .from('projeto')
    .select('*')
    .eq('slug', slug)
    .single()

  if (projError || !projeto) {
    main.innerHTML = `
      <div class="projeto-loading">
        <p>Projeto não encontrado.</p>
        <a href="/" class="btn-outline" style="margin-top:1.5rem;">Voltar ao início</a>
      </div>
    `
    return
  }

  // Parallel queries
  const [imagensRes, unidadesRes, updatesRes] = await Promise.all([
    supabase
      .from('projeto_imagem')
      .select('*')
      .eq('projeto_id', projeto.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('projeto_unidade')
      .select('*')
      .eq('projeto_id', projeto.id)
      .order('andar', { ascending: true }),
    supabase
      .from('projeto_update')
      .select('*')
      .eq('projeto_id', projeto.id)
      .order('data', { ascending: false }),
  ])

  const imagens = imagensRes.data || []
  const unidades = unidadesRes.data || []
  const updates = updatesRes.data || []

  // Update meta
  document.title = `${projeto.nome} — Pilar360`
  const ogTitle = document.getElementById('og-title')
  const ogDesc = document.getElementById('og-desc')
  const ogImage = document.getElementById('og-image')
  if (ogTitle) ogTitle.setAttribute('content', projeto.nome)
  if (ogDesc) ogDesc.setAttribute('content', projeto.descricao || '')
  if (ogImage && projeto.imagem_capa) ogImage.setAttribute('content', projeto.imagem_capa)

  // Render all sections
  main.innerHTML = [
    renderHero(projeto),
    renderSpecsBar(projeto),
    renderDescricaoGaleria(projeto, imagens),
    renderPlanta(projeto),
    renderUnidades(unidades),
    renderSimulador(projeto),
    renderTimeline(updates),
    renderCTA(projeto),
  ].join('')

  // Init interactions
  initLightbox()
  initSimulator(projeto)
  initFadeObserver()
}

init()
