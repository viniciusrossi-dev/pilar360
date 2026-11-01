// Desenho da Rua 125 em SVG, gerado a partir dos dados reais das obras.
// Cada prédio é desenhado no estado em que está: pronto (traço cheio),
// em obra (projeto tracejado + avanço em verde) ou em estudo (contorno leve).
import { PROJETOS, PROXIMOS, EMPRESA, semanaAtual, avancoFisico } from '../data/obras.js'

const W = 1200, CHAO = 360, ANDAR = 62

function janela(x, y, w, h, cls = 'r-vidro') {
  return `<rect class="${cls} r-surge" style="--atraso:.9s" x="${x}" y="${y}" width="${w}" height="${h}" rx="1"/>`
}

// prédio pronto (Aloha): 2 pavimentos, pátio embaixo, sacada em cima
function predioPronto(x, larg, andares) {
  const topo = CHAO - andares * ANDAR - 14
  let s = `<rect class="r-cheio" x="${x}" y="${topo}" width="${larg}" height="${CHAO - topo}"/>`
  s += `<path class="r-traco r-desenha" d="M${x} ${CHAO} V${topo} H${x + larg} V${CHAO}"/>`
  s += `<path class="r-fino r-desenha" style="--atraso:.3s" d="M${x} ${topo + 14} H${x + larg}"/>`
  for (let a = 0; a < andares; a++) {
    const yb = CHAO - a * ANDAR
    if (a > 0) s += `<path class="r-fino r-desenha" style="--atraso:.4s" d="M${x} ${yb} H${x + larg}"/>`
    // duas unidades por andar
    const meio = x + larg / 2
    s += janela(x + 18, yb - 36, 46, 26) + janela(meio + 22, yb - 36, 46, 26)
    if (a === 0) {
      s += `<rect class="r-vidro r-surge" style="--atraso:.9s" x="${meio - 13}" y="${yb - 40}" width="26" height="40"/>` // porta
    } else {
      // guarda-corpo das sacadas
      s += `<path class="r-fino r-surge" style="--atraso:1s" d="M${x + 12} ${yb - 12} H${x + 70} M${meio + 16} ${yb - 12} H${meio + 74}"/>`
    }
  }
  return s
}

// prédio em obra (Sunset): contorno de projeto tracejado + avanço físico em verde
function predioObra(x, larg, andares, pct) {
  const topo = CHAO - andares * ANDAR - 14
  const alt = CHAO - topo
  let s = ''
  if (pct > 0) {
    const h = Math.max(4, alt * pct / 100)
    s += `<rect class="r-avanco r-surge" style="--atraso:1.1s" x="${x}" y="${CHAO - h}" width="${larg}" height="${h}"/>`
  }
  s += `<rect class="r-proj r-surge" style="--atraso:.5s" x="${x}" y="${topo}" width="${larg}" height="${alt}"/>`
  for (let a = 1; a < andares; a++) {
    s += `<path class="r-proj r-surge" style="--atraso:.6s" d="M${x} ${CHAO - a * ANDAR} H${x + larg}"/>`
  }
  for (let a = 0; a < andares; a++) {
    const yb = CHAO - a * ANDAR
    for (let j = 0; j < 4; j++) {
      s += `<rect class="r-proj r-surge" style="--atraso:.7s" x="${x + 14 + j * ((larg - 28) / 4) + 4}" y="${yb - 36}" width="${(larg - 28) / 4 - 8}" height="26"/>`
    }
  }
  // tapume do canteiro: a obra está acontecendo aqui
  const tx = x - 16, tw = larg + 32, th = 34
  s += `<rect class="r-cheio" x="${tx}" y="${CHAO - th}" width="${tw}" height="${th}"/>`
  s += `<path class="r-traco r-desenha" d="M${tx} ${CHAO} V${CHAO - th} H${tx + tw} V${CHAO}"/>`
  let tabuas = ''
  for (let i = tx + 18; i < tx + tw; i += 18) tabuas += `M${i} ${CHAO - th} V${CHAO} `
  s += `<path class="r-fino r-surge" style="--atraso:.9s;opacity:.35" d="${tabuas}"/>`
  s += `<text class="r-status r-surge" style="--atraso:1.2s;font-size:12px" x="${tx + 10}" y="${CHAO - 12}">canteiro de obra</text>`
  return s
}

function predioFuturo(x, larg, andares) {
  const topo = CHAO - andares * ANDAR - 14
  return `<rect class="r-futuro r-surge" style="--atraso:1s" x="${x}" y="${topo}" width="${larg}" height="${CHAO - topo}"/>`
}

function rotulo(x, linhas) {
  const [num, nome, status, ok] = linhas
  return `<g class="r-surge" style="--atraso:1.3s">
    ${num ? `<text class="r-num" x="${x}" y="${CHAO + 42}">${num}</text>` : ''}
    <text class="r-nome" x="${x}" y="${CHAO + (num ? 64 : 40)}">${nome}</text>
    <text class="r-status${ok ? ' ok' : ''}" x="${x}" y="${CHAO + (num ? 84 : 60)}">${status}</text>
  </g>`
}

export function renderRua(container) {
  if (!container) return
  const sunset = PROJETOS.find(p => p.slug === 'residencial-sunset')
  const aloha = PROJETOS.find(p => p.slug === 'residencial-aloha')
  const sem = semanaAtual(sunset)
  const pct = avancoFisico(sunset)
  const statusSunset = sem > 0
    ? `Em obra · semana ${sem} de ${sunset.duracaoSemanas}`
    : 'Obra começa em novembro de 2026'

  const lotes = [
    { x: 70, larg: 240, tipo: 'obra', p: sunset, status: statusSunset },
    { x: 400, larg: 170, tipo: 'futuro', andares: 3 },
    { x: 650, larg: 220, tipo: 'pronto', p: aloha, status: aloha.statusTexto },
    { x: 940, larg: 170, tipo: 'futuro', andares: 3 },
  ]

  let corpo = ''
  for (const l of lotes) {
    if (l.tipo === 'futuro') {
      corpo += predioFuturo(l.x, l.larg, l.andares)
      corpo += rotulo(l.x, [null, PROXIMOS[0].rotulo, PROXIMOS[0].texto])
      continue
    }
    const desenho = l.tipo === 'pronto'
      ? predioPronto(l.x, l.larg, l.p.pavimentos)
      : predioObra(l.x, l.larg, l.p.pavimentos, pct)
    corpo += `<a class="r-predio" href="/projeto.html?id=${l.p.slug}">
      <title>${l.p.nome}, nº ${l.p.numero}: ${l.status}. Ver o projeto.</title>
      ${desenho}
      ${rotulo(l.x, [`Nº ${l.p.numero}`, l.p.nome, l.status, l.tipo === 'pronto'])}
      <rect x="${l.x - 10}" y="40" width="${l.larg + 20}" height="${CHAO + 50}" fill="transparent"/>
    </a>`
  }

  const svg = `
  <svg class="rua-svg" viewBox="0 0 ${W} ${CHAO + 130}" role="img" aria-labelledby="rua-t rua-d">
    <title id="rua-t">Rua 125, Jardim Algarve, Alvorada</title>
    <desc id="rua-d">Desenho da rua com as obras da Pilar 360: Residencial Sunset no número 136, ${statusSunset.toLowerCase()}; Residencial Aloha no número 194, ${aloha.statusTexto.toLowerCase()}; e próximos lotes em estudo.</desc>
    ${corpo}
    <line class="r-chao r-desenha" x1="0" y1="${CHAO}" x2="${W}" y2="${CHAO}"/>
    <line class="r-calcada" x1="0" y1="${CHAO + 100}" x2="${W}" y2="${CHAO + 100}"/>
    <text class="r-rua r-surge" style="--atraso:1.4s" x="0" y="${CHAO + 122}">${EMPRESA.rua} — antiga ${EMPRESA.ruaApelido} · ${EMPRESA.bairro}, ${EMPRESA.cidade}</text>
  </svg>`

  container.innerHTML = `<div class="rua-scroll">${svg}</div>
    <p class="rua-nota">Desenho esquemático, fora de escala. <span class="rua-dica">Arraste para o lado para ver a rua inteira. </span>Toque num prédio para ver a obra.</p>`

  // único movimento da página: o traço se desenha ao carregar
  const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduz) {
    container.querySelectorAll('.r-desenha').forEach(el => {
      try { el.style.setProperty('--len', Math.ceil(el.getTotalLength())) } catch (e) { /* ignora */ }
    })
    container.classList.add('desenhando')
  }
}
