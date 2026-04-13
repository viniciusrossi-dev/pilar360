import { signOut } from './auth.js'

export function renderAdminLayout(activePage) {
  const layout = document.getElementById('admin-layout')
  if (!layout) return
  const currentContent = layout.innerHTML
  layout.innerHTML = `
    <aside class="admin-sidebar">
      <img src="/imagens/logo.svg" alt="Pilar360" class="admin-sidebar-logo">
      <a href="/admin/dashboard.html" class="admin-sidebar-link ${activePage === 'dashboard' ? 'active' : ''}">Dashboard</a>
      <a href="/admin/projetos.html" class="admin-sidebar-link ${activePage === 'projetos' ? 'active' : ''}">Projetos</a>
      <a href="/admin/blog.html" class="admin-sidebar-link ${activePage === 'blog' ? 'active' : ''}">Blog</a>
      <a href="/" target="_blank" class="admin-sidebar-link">Ver site &rarr;</a>
      <button class="admin-sidebar-logout" id="btn-logout">Sair</button>
    </aside>
    <main class="admin-main">${currentContent}</main>
  `
  document.getElementById('btn-logout')?.addEventListener('click', signOut)
}
