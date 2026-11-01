import { renderHeader, waBotao } from './header.js'
import { renderFooter } from './footer.js'
import { getProjeto, semanaAtual } from '../data/obras.js'
import { barraAvanco, itemDiario, esc } from './obras-ui.js'

renderHeader('obras')
renderFooter()

const main = document.getElementById('projeto-content')
const slug = new URLSearchParams(location.search).get('id')
const p = getProjeto(slug)

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const brl = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

if (!p) {
  main.innerHTML = `<div class="wrap p-erro">
    <h1 class="titulo">Obra não encontrada</h1>
    <p class="lead" style="margin:1rem 0 2rem">O endereço pode ter mudado. As obras atuais estão na página inicial.</p>
    <a class="btn-outline" href="/#obras">Ver as obras</a></div>`
} else {
  document.title = `${p.nome} — Pilar 360`
  document.querySelector('meta[name="description"]')?.setAttribute('content', `${p.nome}, Rua 125 nº ${p.numero}, Alvorada: ${p.resumo}`)
  main.innerHTML = [cabeca(), visual(), ficha(), cronograma(), diario(), simulador(), cta()].join('')
  ligar3d()
  ligarSimulador()
}

function cabeca() {
  return `<section class="p-cabeca"><div class="wrap">
    <a class="p-voltar" href="/#obras">← Todas as obras</a>
    <div class="p-cabeca-grade">
      <div>
        <p class="p-endereco">Nº ${p.numero} · Rua 125 · Lote ${p.lote}</p>
        <h1 class="titulo-xl">${esc(p.nome)}</h1>
        <p class="lead">${esc(p.resumo)}</p>
      </div>
      <div>${barraAvanco(p)}</div>
    </div>
  </div></section>`
}

function visual() {
  if (p.tem3d) {
    return `<section><div class="wrap">
      <div class="p-visual" id="p-3d">
        <div class="p-3d-capa" style="background-image:url('${p.imagem}');aspect-ratio:16/9">
          <button class="btn" id="abrir-3d" type="button">Abrir o prédio em 3D</button>
          <figcaption>${esc(p.imagemTipo)}</figcaption>
        </div>
      </div>
      <div class="p-visual-barra">
        <span>Modelo 3D montado a partir da planta aprovada. Arraste para girar; troque de pavimento e de horário no painel.</span>
        <a href="/3d/${p.slug.replace('residencial-', '')}.html" target="_blank" rel="noopener">Abrir em tela cheia</a>
      </div>
    </div></section>`
  }
  const g = p.galeria || []
  return `<section><div class="wrap">
    <div class="p-galeria">
      ${g.map(i => `<figure><img src="${i.src}" alt="${esc(p.nome)}: ${esc(i.legenda)}" loading="lazy"><figcaption>${esc(i.legenda)}</figcaption></figure>`).join('')}
    </div>
  </div></section>`
}

function ficha() {
  return `<section class="bloco"><div class="wrap p-duas">
    <div>
      <h2 class="titulo">Ficha técnica</h2>
      <p class="texto" style="margin-top:1.2rem">Os dados que aparecem na placa da obra e nos documentos do prédio. Matrícula e alvará podem ser conferidos no Registro de Imóveis e na Prefeitura de Alvorada.</p>
      <dl class="ficha" style="margin-top:2rem">
        <div><dt>apartamentos</dt><dd class="num">${p.unidades}</dd></div>
        <div><dt>por unidade</dt><dd>${esc(p.areaUnidade)}</dd></div>
        <div><dt>terreno</dt><dd>${esc(p.terreno)}</dd></div>
      </dl>
    </div>
    <dl class="carimbo">
      <div class="carimbo-titulo"><img src="/imagens/logo.svg" alt="Pilar 360"><span>${esc(p.sistema)}</span></div>
      ${p.carimbo.map(([k, v]) => `<div class="c"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
    </dl>
  </div></section>`
}

function cronograma() {
  if (!p.etapas) return ''
  const total = p.duracaoSemanas
  const ini = new Date(p.inicio + 'T00:00:00')
  const sem = semanaAtual(p)
  const diasTot = total * 7
  const hojePct = sem > 0 ? Math.min(100, (Date.now() - ini) / 86400000 / diasTot * 100) : null

  // escala de meses
  let meses = ''
  const d = new Date(ini.getFullYear(), ini.getMonth() + 1, 1)
  while ((d - ini) / 86400000 < diasTot) {
    const pos = (d - ini) / 86400000 / diasTot * 100
    const rot = d.getMonth() === 0 ? `${MESES[0]} ${String(d.getFullYear()).slice(2)}` : MESES[d.getMonth()]
    if (d.getMonth() % 2 === 0 || d.getMonth() === 0) meses += `<span style="left:${pos}%">${rot}</span>`
    d.setMonth(d.getMonth() + 1)
  }

  const linhas = p.etapas.map(e => {
    const l = (e.semIni - 1) / total * 100
    const w = (e.semFim - e.semIni + 1) / total * 100
    return `<div class="crono-linha">
      <span class="crono-nome"><i>${e.n}</i>${esc(e.nome)}</span>
      <div class="crono-trilho">
        <div class="crono-plan" style="left:${l}%;width:${w}%"><div class="crono-feito" style="width:${e.pct}%"></div></div>
        ${hojePct !== null ? `<div class="crono-hoje" style="left:${hojePct}%"></div>` : ''}
      </div>
      <span class="crono-pct${e.pct === 100 ? ' ok' : ''}">${e.pct}%</span>
    </div>`
  }).join('')

  const inicioTxt = `${ini.getDate()} de ${['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'][ini.getMonth()]} de ${ini.getFullYear()}`
  return `<section class="bloco" id="cronograma" style="padding-top:0"><div class="wrap">
    <div class="bloco-cabeca">
      <h2 class="titulo">Cronograma</h2>
      <p class="texto">As ${p.etapas.length} etapas do contrato de execução, em ${total} semanas contadas a partir da furação das estacas (${sem > 0 ? 'iniciada em' : 'prevista para'} ${inicioTxt}). O avanço de cada etapa é atualizado depois da reunião semanal de obra.</p>
    </div>
    <div class="crono" role="table" aria-label="Cronograma de etapas da obra">
      <div class="crono-escala" aria-hidden="true"><span>Etapa</span><div class="crono-meses">${meses}</div><span style="text-align:right">feito</span></div>
      ${linhas}
    </div>
    <div class="crono-legenda"><span><i></i>planejado</span><span><i class="f"></i>executado</span>${hojePct !== null ? '<span><i class="h"></i>hoje</span>' : ''}</div>
  </div></section>`
}

function diario() {
  const d = (p.diario || []).slice().sort((a, b) => b.data.localeCompare(a.data))
  if (!d.length) return ''
  return `<section class="bloco" style="padding-top:0"><div class="wrap">
    <div class="bloco-cabeca">
      <h2 class="titulo">Diário de obra</h2>
      <p class="texto">Do mais recente para o mais antigo.</p>
    </div>
    <ol class="diario sem-obra">${d.map(e => itemDiario(e)).join('')}</ol>
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
    const box = document.getElementById('p-3d')
    box.innerHTML = `<iframe src="/3d/${p.slug.replace('residencial-', '')}.html" title="${esc(p.nome)} em 3D" allow="fullscreen" loading="eager"></iframe>`
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
