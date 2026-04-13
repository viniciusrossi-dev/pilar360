import { supabase } from './supabase.js'

const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID

export function initContactForm() {
  const form = document.querySelector('.contato-form')
  if (!form) return

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const btn = form.querySelector('.form-submit')
    const originalText = btn.textContent
    btn.textContent = 'Enviando...'
    btn.disabled = true

    const data = {
      nome: form.querySelector('[name="nome"]').value.trim(),
      telefone: form.querySelector('[name="telefone"]').value.trim(),
      email: form.querySelector('[name="email"]').value.trim(),
      perfil: form.querySelector('[name="perfil"]').value,
      mensagem: form.querySelector('[name="mensagem"]').value.trim(),
    }

    if (!data.nome || !data.email || !data.mensagem) {
      showFormFeedback(form, 'Por favor, preencha nome, email e mensagem.', 'error')
      btn.textContent = originalText
      btn.disabled = false
      return
    }

    try {
      const [supaResult, formspreeResult] = await Promise.allSettled([
        supabase.from('contato_mensagem').insert([data]),
        fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
      ])

      const anySuccess = (supaResult.status === 'fulfilled' && !supaResult.value.error)
        || (formspreeResult.status === 'fulfilled' && formspreeResult.value.ok)

      if (anySuccess) {
        showFormFeedback(form, 'Mensagem enviada! Retornaremos em breve.', 'success')
        form.reset()
      } else {
        throw new Error('Ambos os envios falharam')
      }
    } catch (err) {
      console.error('Contact form error:', err)
      showFormFeedback(form, 'Erro ao enviar. Tente novamente ou entre em contato por WhatsApp.', 'error')
    } finally {
      btn.textContent = originalText
      btn.disabled = false
    }
  })
}

function showFormFeedback(form, message, type) {
  let el = form.querySelector('.form-feedback')
  if (!el) {
    el = document.createElement('div')
    el.className = 'form-feedback'
    form.appendChild(el)
  }
  el.textContent = message
  el.className = `form-feedback form-feedback--${type}`
  setTimeout(() => el.remove(), 6000)
}
