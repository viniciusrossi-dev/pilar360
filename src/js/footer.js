import { EMPRESA } from '../data/obras.js'
import { waLink } from './header.js'

export function renderFooter() {
  const placeholder = document.getElementById('site-footer')
  if (!placeholder) return
  const ano = new Date().getFullYear()

  placeholder.innerHTML = `
    <footer class="rodape">
      <div class="wrap">
        <div class="rodape-grade">
          <div class="rodape-col">
            <img class="rodape-logo" src="/imagens/logo-vertical-negativo.svg" alt="Pilar 360" height="92" style="height:92px;width:auto">
          </div>
          <div class="rodape-col">
            <b>Fale com a gente</b>
            <a href="${waLink()}" target="_blank" rel="noopener">WhatsApp ${EMPRESA.whatsappLabel}</a>
            <a href="mailto:${EMPRESA.email}">${EMPRESA.email}</a>
            <a href="https://instagram.com/${EMPRESA.instagram}" target="_blank" rel="noopener">Instagram @${EMPRESA.instagram}</a>
          </div>
          <div class="rodape-col">
            <b>${EMPRESA.nome}</b>
            <span>CNPJ ${EMPRESA.cnpj}</span>
            <span>${EMPRESA.regiao} · RS</span>
            <p class="rodape-legal">Renders são ilustrativos e indicados como tal. Condições do Minha Casa Minha Vida seguem as regras vigentes da Caixa.</p>
          </div>
        </div>
        <div class="rodape-baixo">
          <span>© ${ano} Pilar 360</span>
          <a href="/admin/">Acesso restrito</a>
        </div>
      </div>
    </footer>
  `
}
