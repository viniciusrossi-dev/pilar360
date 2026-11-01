// Formulário de contato: monta a mensagem e abre no WhatsApp da Pilar.
// Em paralelo tenta registrar no Supabase (tabela contato_mensagem) para o admin.
// Se o banco estiver fora do ar, o contato chega do mesmo jeito pelo WhatsApp.
import { supabase } from './supabase.js'
import { EMPRESA } from '../data/obras.js'

export function initContactForm() {
  const form = document.querySelector('.contato-form')
  if (!form) return

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const v = (n) => (form.querySelector(`[name="${n}"]`)?.value || '').trim()
    const dados = { nome: v('nome'), telefone: v('telefone'), perfil: v('perfil'), mensagem: v('mensagem') }

    if (!dados.nome || !dados.mensagem) {
      feedback(form, 'Escreva seu nome e a mensagem para enviar.', 'error')
      ;(dados.nome ? form.querySelector('[name="mensagem"]') : form.querySelector('[name="nome"]')).focus()
      return
    }

    const texto = `Olá! Sou ${dados.nome}${dados.telefone ? ` (${dados.telefone})` : ''}.\n` +
      `Assunto: ${dados.perfil}.\n\n${dados.mensagem}`
    window.open(`https://wa.me/${EMPRESA.whatsapp}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener')

    // registro opcional, sem bloquear o envio
    try {
      supabase.from('contato_mensagem')
        .insert([{ ...dados, email: '-' }])
        .then(() => {}, () => {})
    } catch (err) { /* banco indisponível */ }

    feedback(form, 'Abrimos o WhatsApp com a sua mensagem. É só confirmar o envio por lá.', 'success')
    form.reset()
  })
}

function feedback(form, mensagem, tipo) {
  let el = form.querySelector('.form-feedback')
  if (!el) {
    el = document.createElement('div')
    el.setAttribute('role', 'status')
    form.appendChild(el)
  }
  el.textContent = mensagem
  el.className = `form-feedback form-feedback--${tipo}`
}
