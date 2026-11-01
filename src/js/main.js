import { renderHeader, waBotao, waLink } from './header.js'
import { renderFooter } from './footer.js'
import { initContactForm } from './formspree.js'
import { PROJETOS, EMPRESA } from '../data/obras.js'
import { esc } from './obras-ui.js'
import { iniciarMovimento } from './motion.js'

renderHeader()
renderFooter()

document.getElementById('cta-morar').innerHTML =
  waBotao('Conversar sobre um apartamento', 'Olá! Quero saber dos apartamentos da Pilar 360 para morar.')
document.getElementById('cta-investir').innerHTML =
  `<a class="btn-outline" href="${waLink('Olá! Tenho interesse em investir com a Pilar 360.')}" target="_blank" rel="noopener">Agendar conversa com os sócios</a>`
document.getElementById('cta-terreno').innerHTML =
  `<a class="link" href="${waLink('Olá! Tenho um terreno na Grande Porto Alegre e quero conversar com a Pilar 360.')}" target="_blank" rel="noopener">Oferecer um terreno</a>`

// portfólio: só o estágio de cada empreendimento
document.getElementById('portfolio').innerHTML = PROJETOS.map((p, i) => `
  <a class="port${i === 0 ? ' port-maior' : ''}" href="/projeto.html?id=${p.slug}">
    <figure class="port-foto">
      <img src="${p.imagem}" alt="${esc(p.nome)}: ${esc(p.imagemTipo.toLowerCase())}" loading="lazy" style="view-transition-name:foto-${p.slug}">
      <figcaption>${esc(p.imagemTipo)}</figcaption>
    </figure>
    <div class="port-info">
      <span class="estagio${p.status === 'pronto' ? ' estagio-ok' : ''}">${esc(p.estagio)}</span>
      <h3 class="port-nome">${esc(p.nome)}</h3>
      <p>${esc(p.chamada)}</p>
      <span class="port-local">${esc(p.local)} · ${p.unidades} apartamentos de ${esc(p.tipologia)}</span>
    </div>
  </a>`).join('')

document.getElementById('contato-canais').innerHTML = `
  <div class="canal"><span>WhatsApp</span><a href="${waLink()}" target="_blank" rel="noopener">${EMPRESA.whatsappLabel}</a></div>
  <div class="canal"><span>E-mail</span><a href="mailto:${EMPRESA.email}">${EMPRESA.email}</a></div>
  <div class="canal"><span>Instagram</span><a href="https://instagram.com/${EMPRESA.instagram}" target="_blank" rel="noopener">@${EMPRESA.instagram}</a></div>`
initContactForm()
iniciarMovimento()
