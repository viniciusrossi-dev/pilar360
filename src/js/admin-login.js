import { supabase } from './supabase.js'

// Se já tem sessão ativa, redireciona direto pro dashboard
const { data: { session: existingSession } } = await supabase.auth.getSession()
if (existingSession) {
  window.location.href = '/admin/dashboard.html'
}

// Elementos
const form = document.getElementById('login-form')
const errorMsg = document.getElementById('error-msg')
const btnSubmit = document.getElementById('btn-submit')

function showError(msg) {
  errorMsg.textContent = msg
  errorMsg.classList.add('visible')
}

function hideError() {
  errorMsg.classList.remove('visible')
  errorMsg.textContent = ''
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault()
  hideError()

  const email = form.email.value.trim()
  const password = form.password.value

  if (!email || !password) {
    showError('Preencha e-mail e senha.')
    return
  }

  btnSubmit.disabled = true
  btnSubmit.textContent = 'Entrando…'

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    showError('Credenciais inválidas. Verifique e-mail e senha.')
    btnSubmit.disabled = false
    btnSubmit.textContent = 'Entrar'
    return
  }

  window.location.href = '/admin/dashboard.html'
})
