// Pedaços de interface compartilhados.
import { fasesDo } from '../data/obras.js'

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

// "2026-05" → "maio de 2026"; "2026-05-12" → "12 de maio de 2026"
export function dataExtenso(iso) {
  const [a, m, d] = iso.split('-').map(Number)
  return d ? `${d} de ${MESES[m - 1]} de ${a}` : `${MESES[m - 1]} de ${a}`
}

export function esc(s = '') {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
}

// trilha das fases da obra
export function trilhaFases(p) {
  const fs = fasesDo(p)
  const rot = { feita: 'concluída', andamento: 'em andamento', aseguir: 'a seguir' }
  return `<ol class="fases">${fs.map(f => `
    <li class="fase fase-${f.situacao}">
      <span class="fase-marca" aria-hidden="true"></span>
      <b>${esc(f.nome)}</b>
      <span class="fase-sit">${rot[f.situacao]}</span>
    </li>`).join('')}</ol>`
}
