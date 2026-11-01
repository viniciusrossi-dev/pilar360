import { renderHeader, waBotao } from './header.js'
import { renderFooter } from './footer.js'
import { getProjeto, faseAtual } from '../data/obras.js'
import { trilhaFases, dataExtenso, esc } from './obras-ui.js'
import { iniciarMovimento } from './motion.js'

renderHeader('empreendimentos')
renderFooter()

const main = document.getElementById('projeto-content')
const slug = new URLSearchParams(location.search).get('id')
const p = getProjeto(slug)
const brl = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

if (!p) {
  main.innerHTML = `<div class="wrap p-erro">
    <h1 class="titulo">Empreendimento não encontrado</h1>
    <p class="lead" style="margin:1rem 0 2rem">O endereço pode ter mudado. Os empreendimentos atuais estão na página inicial.</p>
    <a class="btn-outline" href="/#empreendimentos">Ver os empreendimentos</a></div>`
} else {
  document.title = `${p.nome} — Pilar 360`
  document.querySelector('meta[name="description"]')?.setAttribute('content', `${p.nome}: ${p.resumo}`)
  main.innerHTML = [cabeca(), visual(), sobre(), obra(), diario(), simulador(), cta()].join('')
  ligar3d()
  ligarSimulador()
  iniciarMovimento()
}

function cabeca() {
  return `<section class="p-cabeca"><div class="wrap">
    <a class="p-voltar" href="/#empreendimentos">← Empreendimentos</a>
    <div class="p-cabeca-grade">
      <div>
        <span class="estagio${p.status === 'pronto' ? ' estagio-ok' : ''}">${esc(p.estagio)}</span>
        <h1 class="titulo-xl" style="margin-top:.6rem">${esc(p.nome)}</h1>
      </div>
      <div>
        <p class="lead">${esc(p.resumo)}</p>
        <dl class="ficha" style="margin-top:1.6rem">
          <div><dt>apartamentos</dt><dd class="num">${p.unidades}</dd></div>
          <div><dt>tipologia</dt><dd>${esc(p.tipologia)}</dd></div>
          <div><dt>por unidade</dt><dd>${esc(p.areaUnidade)}</dd></div>
        </dl>
      </div>
    </div>
  </div></section>`
}

function visual() {
  if (p.tem3d) {
    return `<section><div class="wrap">
      <div class="p-visual" id="p-3d">
        <div class="p-3d-capa" style="background-image:url('${p.imagem}');view-transition-name:foto-${p.slug}">
          <button class="btn" id="abrir-3d" type="button">Explorar o prédio em 3D</button>
          <figcaption>${esc(p.imagemTipo)}</figcaption>
        </div>
      </div>
      <div class="p-visual-barra">
        <span>Modelo 3D feito a partir do projeto aprovado. Gire o prédio, entre nos pavimentos e veja de dia ou de noite.</span>
        <a href="/3d/${p.slug.replace('residencial-', '')}.html" target="_blank" rel="noopener">Abrir em tela cheia</a>
      </div>
    </div></section>`
  }
  const g = p.galeria || []
  return `<section><div class="wrap">
    <div class="p-galeria">
      ${g.map(i => `<figure${i.src === p.imagem ? ' class="vt-alvo"' : ''}><img src="${i.src}"${i.src === p.imagem ? ` style="view-transition-name:foto-${p.slug}"` : ''} alt="${esc(p.nome)}: ${esc(i.legenda)}" loading="lazy"><figcaption>${esc(i.legenda)}</figcaption></figure>`).join('')}
    </div>
  </div></section>`
}

function sobre() {
  return `<section class="bloco"><div class="wrap p-duas">
    <div>
      <h2 class="titulo">${esc(p.chamada)}</h2>
      <ul class="destaques">${p.destaques.map(d => `<li>${esc(d)}</li>`).join('')}</ul>
    </div>
    <div>
      <dl class="carimbo">
        <div class="carimbo-titulo"><img src="/imagens/logo.svg" alt="Pilar 360"><span>Documentação</span></div>
        ${p.carimbo.map(([k, v]) => `<div class="c"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
      </dl>
      <p class="form-nota" style="margin-top:.8rem">Dados públicos do registro de imóveis e da prefeitura, para você conferir.</p>
    </div>
  </div></section>`
}

function obra() {
  const pronto = p.status === 'pronto'
  const texto = pronto
    ? 'Todas as fases concluídas.'
    : `Agora: ${faseAtual(p).toLowerCase()}. Entrega prevista para o ${p.entregaPrevista}.`
  return `<section class="bloco" style="padding-top:0"><div class="wrap">
    <div class="bloco-cabeca">
      <h2 class="titulo">A obra</h2>
      <p class="texto">${texto}</p>
    </div>
    ${trilhaFases(p)}
  </div></section>`
}

function diario() {
  const d = (p.diario || []).slice().sort((a, b) => b.data.localeCompare(a.data))
  if (!d.length) return ''
  return `<section class="bloco" style="padding-top:0"><div class="wrap">
    <div class="bloco-cabeca">
      <h2 class="titulo">Diário do ${esc(p.nome.replace('Residencial ', ''))}</h2>
      <p class="texto">Novidades do canteiro, da mais recente para a mais antiga. Fotos e vídeos também no nosso Instagram.</p>
    </div>
    <ol class="diario">${d.map(e => `
      <li>
        ${e.foto ? `<img src="${e.foto}" alt="" loading="lazy">` : ''}
        <time datetime="${e.data}">${dataExtenso(e.data)}</time>
        <h3>${esc(e.titulo)}</h3>
        <p>${esc(e.texto)}</p>
      </li>`).join('')}</ol>
  </div></section>`
}

function simulador() {
  return `<section class="bloco" style="padding-top:0"><div class="wrap">
    <div class="sim">
      <h2 class="subtitulo" style="font-size:clamp(2rem,4vw,2.8rem)">Quanto ficaria a parcela?</h2>
      <p class="texto" style="margin-top:.6rem">Uma conta rápida para ter ideia do enquadramento no Minha Casa Minha Vida. A simulação oficial é feita com a Caixa.</p>
      <form class="sim-form" id="sim" novalidate>
        <div class="form-group"><label for="sim-renda">Renda familiar bruta por mês</label><input id="sim-renda" inputmode="decimal" placeholder="R$ 3.500"></div>
        <div class="form-group"><label for="sim-valor">Valor do imóvel</label><input id="sim-valor" inputmode="decimal" placeholder="Consulte a tabela com a gente"></div>
        <button class="btn-dark" type="submit">Calcular</button>
      </form>
      <div id="sim-res" aria-live="polite"></div>
    </div>
  </div></section>`
}

function cta() {
  return `<section class="bloco" style="padding-top:0"><div class="wrap p-cta">
    <h2 class="titulo" style="max-width:10em">Quer visitar ou saber valores?</h2>
    ${waBotao('Falar sobre o ' + p.nome.replace('Residencial ', ''), `Olá! Quero saber mais sobre o ${p.nome}.`)}
  </div></section>`
}

function ligar3d() {
  const b = document.getElementById('abrir-3d')
  if (!b) return
  b.addEventListener('click', () => {
    document.getElementById('p-3d').innerHTML =
      `<iframe src="/3d/${p.slug.replace('residencial-', '')}.html" title="${esc(p.nome)} em 3D" allow="fullscreen"></iframe>`
  })
}

// Faixas do MCMV vigentes desde 22/04/2026 (renda familiar bruta mensal).
// Juros aproximados por faixa; a Caixa define a taxa final pelo perfil do comprador.
const FAIXAS = [
  { ate: 3200, nome: 'Faixa 1', juros: 4.5 },
  { ate: 5000, nome: 'Faixa 2', juros: 6 },
  { ate: 9600, nome: 'Faixa 3', juros: 8.16 },
  { ate: 13000, nome: 'Faixa 4', juros: 10 },
]

function ligarSimulador() {
  const f = document.getElementById('sim')
  if (!f) return
  const num = (s) => parseFloat(String(s).replace(/[^\d,]/g, '').replace(',', '.')) || 0
  f.addEventListener('submit', (e) => {
    e.preventDefault()
    const renda = num(f.querySelector('#sim-renda').value)
    const valor = num(f.querySelector('#sim-valor').value)
    const out = document.getElementById('sim-res')
    if (!renda || !valor) {
      out.innerHTML = '<p class="sim-erro">Preencha a renda e o valor do imóvel para calcular.</p>'
      return
    }
    const faixa = FAIXAS.find(x => renda <= x.ate)
    if (!faixa) {
      out.innerHTML = '<p class="sim-erro">Essa renda fica acima do limite do programa (R$ 13.000). Fale com a gente sobre outras formas de financiamento.</p>'
      return
    }
    const financiado = valor * 0.8
    const i = faixa.juros / 12 / 100
    const n = 420
    const parcela = financiado * i * Math.pow(1 + i, n) / (Math.pow(1 + i, n) - 1)
    out.innerHTML = `<dl class="sim-res">
        <div><dt>enquadramento</dt><dd>${faixa.nome}</dd></div>
        <div><dt>entrada mínima (20%)</dt><dd class="num">${brl(valor * 0.2)}</dd></div>
        <div><dt>parcela estimada</dt><dd class="num">${brl(parcela)}</dd></div>
      </dl>
      <p class="sim-nota">Conta sem subsídio: nas faixas 1 e 2 o subsídio do governo e o FGTS podem reduzir a entrada e a parcela. Juros de referência de ${String(faixa.juros).replace('.', ',')}% ao ano, 420 meses, tabela Price. A Caixa define taxa, prazo e subsídio na análise de crédito.</p>`
  })
}
