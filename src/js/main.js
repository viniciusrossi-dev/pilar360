import { renderHeader, waBotao } from './header.js'
import { renderFooter } from './footer.js'
import { initContactForm } from './formspree.js'
import { renderRua } from './rua125.js'
import { PROJETOS, HISTORIA, EMPRESA } from '../data/obras.js'
import { barraAvanco, itemDiario, dataCurta, esc } from './obras-ui.js'

renderHeader()
renderFooter()
renderRua(document.getElementById('rua'))

// botões de ação
document.getElementById('abertura-acoes').innerHTML =
  waBotao('Quero morar num deles', 'Olá! Vim pelo site e quero saber dos apartamentos da Pilar 360.') +
  '<a class="link" href="#obras">Ver as obras</a>'
document.getElementById('cta-morar').innerHTML =
  waBotao('Conversar sobre um apartamento', 'Olá! Quero saber dos apartamentos da Pilar 360 para morar.')
document.getElementById('cta-investir').innerHTML =
  `<a class="btn-outline" href="https://wa.me/${EMPRESA.whatsapp}?text=${encodeURIComponent('Olá! Tenho interesse em investir com a Pilar 360.')}" target="_blank" rel="noopener">Agendar conversa com os sócios</a>`

// obras: o que está pronto primeiro, depois o que está em obra
const ordem = { pronto: 0, obra: 1 }
document.getElementById('lista-obras').innerHTML = [...PROJETOS]
  .sort((a, b) => ordem[a.status] - ordem[b.status])
  .map(p => `
  <a class="obra" href="/projeto.html?id=${p.slug}">
    <figure class="obra-foto">
      <img src="${p.imagem}" alt="${esc(p.nome)}: ${esc(p.imagemTipo.toLowerCase())}" loading="lazy">
      <figcaption>${esc(p.imagemTipo)}</figcaption>
    </figure>
    <div class="obra-info">
      <span class="obra-num">Nº ${p.numero} · Lote ${p.lote}</span>
      <h3 class="obra-nome">${esc(p.nome)}</h3>
      <p class="obra-resumo">${esc(p.resumo)}</p>
      <dl class="ficha">
        <div><dt>apartamentos</dt><dd class="num">${p.unidades}</dd></div>
        <div><dt>por unidade</dt><dd>${esc(p.areaUnidade)}</dd></div>
        <div><dt>pavimentos</dt><dd class="num">${p.pavimentos}</dd></div>
      </dl>
      ${barraAvanco(p)}
      <span class="obra-mais">Ficha técnica, cronograma e diário</span>
    </div>
  </a>`).join('')

// história: o que já aconteceu fica marcado; o próximo passo aparece aberto
const hoje = new Date().toISOString().slice(0, 7)
document.getElementById('historia').innerHTML = HISTORIA.map((h, i) => {
  const passou = h.data < hoje
  const proximo = !passou && (i === 0 || HISTORIA[i - 1].data < hoje)
  const cls = passou ? 'feito' : (proximo ? 'agora proximo' : '')
  return `<li class="${cls}">
    <time datetime="${h.data}">${dataCurta(h.data)}</time>
    <div><b>${esc(h.titulo)}</b><p>${esc(h.texto)}</p></div>
  </li>`
}).join('')

// diário: registros mais recentes das duas obras
const registros = PROJETOS.flatMap(p => (p.diario || []).map(e => ({ ...e, obra: p.nome })))
  .sort((a, b) => b.data.localeCompare(a.data))
  .slice(0, 6)
document.getElementById('diario-lista').innerHTML = registros.map(e => itemDiario(e, e.obra)).join('')

// contato
document.getElementById('contato-canais').innerHTML = `
  <div class="canal"><span>WhatsApp</span><a href="https://wa.me/${EMPRESA.whatsapp}" target="_blank" rel="noopener">${EMPRESA.whatsappLabel}</a></div>
  <div class="canal"><span>E-mail</span><a href="mailto:${EMPRESA.email}">${EMPRESA.email}</a></div>
  <div class="canal"><span>Instagram</span><a href="https://instagram.com/${EMPRESA.instagram}" target="_blank" rel="noopener">@${EMPRESA.instagram}</a></div>
  <div class="canal"><span>Onde construímos</span><strong>${EMPRESA.bairro}, ${EMPRESA.cidade}</strong></div>`
initContactForm()
