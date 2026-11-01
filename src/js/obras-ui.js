// Pedaços de interface compartilhados entre a home e a página de projeto.
import { semanaAtual, avancoFisico, avancoPrevisto } from '../data/obras.js'

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export function dataCurta(iso) {
  const [a, m, d] = iso.split('-').map(Number)
  return d ? `${d} ${MESES[m - 1]} ${a}` : `${MESES[m - 1]} ${a}`
}

export function esc(s = '') {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
}

// barra de avanço físico (feito × previsto)
export function barraAvanco(p) {
  if (p.status === 'pronto') {
    return `<p class="selo-ok">${esc(p.statusTexto)}</p>`
  }
  const sem = semanaAtual(p)
  const feito = avancoFisico(p)
  const prev = avancoPrevisto(p, sem)
  const legenda = sem > 0
    ? `Semana ${sem} de ${p.duracaoSemanas}. Previsto até aqui: ${prev}%.`
    : `A obra começa em ${dataCurta(p.inicio.slice(0, 7))}. Entrega prevista: ${p.entregaPrevista}.`
  return `<div class="avanco">
    <div class="avanco-topo"><span>Avanço da obra</span><b class="num">${feito}%</b></div>
    <div class="avanco-trilho" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${feito}" aria-label="Avanço físico da obra">
      <div class="avanco-feito" style="width:${feito}%"></div>
      ${sem > 0 ? `<div class="avanco-previsto" style="left:${prev}%" title="Previsto: ${prev}%"></div>` : ''}
    </div>
    <span class="avanco-legenda">${legenda}</span>
  </div>`
}

export function itemDiario(e, nomeObra) {
  return `<li>
    <time datetime="${e.data}">${dataCurta(e.data)}</time>
    ${nomeObra ? `<span class="onde">${esc(nomeObra)}</span>` : ''}
    <div><b>${esc(e.titulo)}</b><p>${esc(e.texto)}</p></div>
  </li>`
}
