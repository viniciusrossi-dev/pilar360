import { supabase } from './supabase.js'

export async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) { window.location.href = '/admin/index.html'; return null }
  return session
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function signOut() {
  await supabase.auth.signOut()
  window.location.href = '/admin/index.html'
}
