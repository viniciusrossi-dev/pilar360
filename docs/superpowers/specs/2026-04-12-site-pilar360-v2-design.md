# Site Pilar360 v2 — Design Spec

**Data:** 2026-04-12
**Status:** Aprovado

---

## Objetivo

Evoluir o site institucional estático da Pilar360 (HTML/CSS/JS) em três frentes:
1. Formulário de contato funcional (email + armazenamento)
2. Página de detalhe de projeto com galeria, unidades, simulador MCMV e timeline de obra
3. Blog com conteúdo regular sobre empresa, mercado e dicas

Além disso, criar um painel admin protegido por senha para gerenciar projetos, unidades, updates de obra, posts do blog e mensagens de contato.

## Decisões Técnicas

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Stack front | Vanilla HTML/CSS/JS + Vite | Mantém simplicidade, ganha DX (hot reload, imports, build) |
| Backend | Supabase (projeto novo, free tier) | Já conhecido do Octi, banco + auth + storage grátis |
| Formulário | Formspree (email) + Supabase (armazenamento) | Notificação imediata + histórico no admin |
| Hosting | Netlify (free tier) | Deploy automático via git, HTTPS, domínio custom |
| Editor rico (blog) | Quill.js | Leve, gratuito, sem dependências |
| Auth admin | Supabase Auth (email/senha) | Sem signup público, admin criado manualmente |

## Estrutura de Arquivos

```
pilar360/
  index.html                  # Home (adaptar do existente)
  projeto.html                # Detalhe do projeto (?id=slug)
  blog.html                   # Listagem de posts
  post.html                   # Post individual (?slug=X)
  admin/
    index.html                # Login admin
    dashboard.html            # Painel principal + mensagens
    projetos.html             # CRUD projetos + unidades + updates + galeria
    blog.html                 # CRUD posts do blog
  src/
    js/
      supabase.js             # Client Supabase inicializado
      auth.js                 # Guard de auth para páginas admin
      header.js               # Injeta nav em todas as páginas
      footer.js               # Injeta footer em todas as páginas
      formspree.js            # Lógica do formulário de contato
      simulador.js            # Calculadora MCMV
    css/
      style.css               # CSS do site público (atual, movido)
      admin.css               # CSS do painel admin (tema claro)
  imagens/                    # Assets estáticos (já existe)
  vite.config.js              # Multi-page config
  package.json
```

## Banco de Dados (Supabase)

### Tabelas

**Auth:** Supabase Auth gerencia os usuarios admin. Sem tabela custom — dados ficam em `auth.users` (campo `raw_user_meta_data` para nome). Admin criado manualmente no dashboard do Supabase.

#### projeto
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | serial, PK | |
| nome | text | "Residencial Aloha" |
| slug | text, unique | "residencial-aloha" |
| localizacao | text | "Porto Verde - Alvorada, RS" |
| descricao | text | Texto longo sobre o empreendimento |
| status | text | "Em Construção", "Em fase final", "Entregue" |
| tipologia | text | "1 Dorm", "2 Dorm" |
| metragem | text | "33-35m2" |
| total_unidades | int | |
| data_entrega | text | "Out/2026" |
| valor_base | numeric | Preco base para simulador |
| latitude | numeric | |
| longitude | numeric | |
| planta_url | text | URL da planta baixa no Storage |
| imagem_capa_url | text | |
| sort_order | int | |
| ativo | boolean, default true | |
| created_at | timestamptz | |

#### projeto_imagem
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | serial, PK | |
| projeto_id | FK -> projeto | |
| url | text | |
| legenda | text | |
| sort_order | int | |

#### projeto_unidade
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | serial, PK | |
| projeto_id | FK -> projeto | |
| identificador | text | "Apto 101" |
| tipologia | text | "1 Dorm" |
| metragem | numeric | 33.5 |
| valor | numeric | 185000.00 |
| status | text | "disponivel", "reservada", "vendida" |
| andar | text | |
| observacao | text | |
| updated_at | timestamptz | |

#### projeto_update
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | serial, PK | |
| projeto_id | FK -> projeto | |
| titulo | text | "Estrutura concluida" |
| descricao | text | |
| imagem_url | text | |
| data | date | Data do update |
| created_at | timestamptz | |

#### blog_post
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | serial, PK | |
| titulo | text | |
| slug | text, unique | |
| resumo | text | Preview na listagem |
| conteudo | text | HTML do editor rico |
| categoria | text | "empresa", "mercado", "dicas" |
| imagem_capa_url | text | |
| publicado | boolean, default false | |
| publicado_em | timestamptz | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### contato_mensagem
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | serial, PK | |
| nome | text | |
| telefone | text | |
| email | text | |
| perfil | text | |
| mensagem | text | |
| lido | boolean, default false | |
| created_at | timestamptz | |

### RLS

- **Tabelas publicas** (`projeto`, `projeto_imagem`, `projeto_unidade`, `projeto_update`, `blog_post`): SELECT liberado para `anon`. INSERT/UPDATE/DELETE restrito a `authenticated`.
- **`blog_post`**: SELECT anon filtra `publicado = true`. SELECT authenticated ve todos (incluindo rascunhos).
- **`contato_mensagem`**: INSERT liberado para `anon` (formulario). SELECT somente `authenticated` (admin).

### Storage

1 bucket `pilar360` com pastas: `projetos/`, `blog/`, `plantas/`.
Upload somente autenticado, leitura publica.

## Formulario de Contato

### Fluxo
1. Usuario preenche o form e clica "Enviar Mensagem"
2. JS valida campos obrigatorios (nome, email, mensagem)
3. Insere na tabela `contato_mensagem` via Supabase (anon insert)
4. Em paralelo, envia para Formspree (dispara email para viniciusrossi@hotmail.com.br)
5. Feedback: "Mensagem enviada! Retornaremos em breve."

### Formspree
Plano gratuito (50 envios/mes). Sem backend — o form aponta para a URL do Formspree. Suficiente para o volume da Pilar360.

## Pagina de Detalhe do Projeto

Uma unica `projeto.html` que carrega dados via query param `?id={slug}`.

### Secoes (de cima para baixo)

1. **Hero** — imagem de capa fullwidth com nome, localizacao e badge de status sobrepostos.
2. **Specs rapidos** — barra horizontal: total de unidades, metragem, tipologia, previsao de entrega. Estilo da barra de numeros da home.
3. **Sobre o empreendimento** — texto descritivo + galeria de fotos (grid com lightbox ao clicar). Fotos de `projeto_imagem`.
4. **Planta baixa** — imagem da planta com zoom ao clicar. Campo `planta_url`.
5. **Tabela de unidades** — colunas: Unidade, Tipologia, Metragem, Andar, Valor, Status. Cores de status: verde (disponivel), amarelo (reservada), cinza (vendida). Dados de `projeto_unidade`.
6. **Simulador MCMV** — campos: renda familiar, valor do imovel (pre-preenchido com `valor_base`). Calcula: faixa MCMV, subsidio estimado, valor de entrada, parcela estimada. Botao "Falar com um consultor" abre WhatsApp com mensagem: "Ola! Simulei o financiamento do [projeto] e gostaria de mais informacoes. Renda: R$ X, Faixa: Y."
7. **Timeline de obra** — lista cronologica vertical (recente em cima). Cada item: data, titulo, descricao, foto opcional. Dados de `projeto_update`.
8. **CTA final** — "Gostou? Entre em contato" com botoes WhatsApp e formulario.

Na home, cards de projeto viram links para `projeto.html?id={slug}`.

## Blog

### Listagem (blog.html)
- Header com titulo "Blog" e filtro por categoria (chips: Todos, Empresa, Mercado, Dicas)
- Grid de cards: imagem de capa, tag de categoria, titulo, resumo (2 linhas), data
- Ordenado por `publicado_em` desc
- Sem paginacao inicial — ultimos 20 posts. "Carregar mais" se crescer.

### Post individual (post.html?slug=X)
- Hero com imagem de capa, titulo, categoria, data
- Corpo do artigo — HTML renderizado do campo `conteudo`
- Rodape com "Posts relacionados" (mesma categoria, ultimos 3)
- CTA final: "Gostou? Conheca nossos projetos" ou "Fale conosco"
- Botoes de compartilhar (WhatsApp, copiar link)

### Integracao com Home
- Nova secao "Do nosso blog" com 3 posts mais recentes, antes da secao de contato
- Novo link "Blog" na nav, entre "Projetos" e "Nossa Essencia"

## Painel Admin

Acessivel via `/admin/`. Login com email/senha do Supabase Auth. Admin criado manualmente no dashboard do Supabase (sem signup publico).

### Dashboard (admin/dashboard.html)
- Resumo: mensagens nao lidas, posts publicados, unidades disponiveis por projeto
- Lista das ultimas 5 mensagens de contato (com marcar como lida)
- Atalhos para secoes

### Gerenciar Projetos (admin/projetos.html)
- Lista de projetos com botao editar/novo
- Form de edicao com todos os campos da tabela `projeto`
- Sub-secoes:
  - **Galeria**: upload de imagens, drag-to-reorder, delete. Storage do Supabase.
  - **Unidades**: tabela editavel inline. Adicionar/remover, alterar status com dropdown.
  - **Updates de obra**: lista com "Novo update". Form: data, titulo, descricao, foto opcional.
  - **Planta baixa**: upload single image.

### Gerenciar Blog (admin/blog.html)
- Lista de posts (publicados e rascunhos)
- Form: titulo, slug (auto-gerado, editavel), resumo, categoria (dropdown), imagem de capa (upload)
- Editor rico Quill.js — toolbar: headings, bold, italic, listas, links, imagens inline
- Toggle publicar/rascunho
- Preview antes de publicar

### Mensagens (no dashboard)
- Lista completa com filtro lido/nao-lido
- Expandir para ver conteudo completo
- Botao "Marcar como lida"

### Design do admin
Tema claro (branco/cinza), limpo e funcional. Tipografia DM Sans para consistencia com o site publico. Prioridade e usabilidade, nao estetica.

## Hosting e Deploy

### Netlify (free tier)
- Conecta ao repo git
- Build command: `npm run build` (Vite gera `dist/`)
- Deploy automatico a cada push em `main`
- HTTPS gratis + dominio custom futuro (`pilar360.com.br`)
- Redirect rules para paginas dinamicas

### Variaveis de ambiente (Netlify)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_FORMSPREE_ID`

Chaves publicas — seguranca fica no RLS do Supabase.

### Vite Multi-Page

`vite.config.js` deve declarar cada HTML como entry point em `build.rollupOptions.input` (index, projeto, blog, post, admin/index, admin/dashboard, admin/projetos, admin/blog).

## Notas Adicionais

- **Slugs**: auto-gerados a partir do titulo (kebab-case). Se colidir com existente, append `-2`, `-3`, etc. Constraint UNIQUE no banco garante integridade.
- **Imagens**: comprimir client-side antes de upload (max ~1MB). Supabase Image Transformations disponivel para resize on-the-fly se necessario.
- **SEO**: paginas de projeto e blog devem incluir Open Graph meta tags (og:title, og:description, og:image) para compartilhamento em redes sociais e WhatsApp.
- **Formspree limite**: free tier permite 50 envios/mes. Se crescer, migrar para Supabase Edge Function + servico de email (ex: Resend).

## Design Visual

O site publico mantem a estetica atual:
- Tema dark (fundo `#0A0A0A`, texto `#F5F5F0`)
- Cor primaria verde `#7AB648`
- Fontes: Bebas Neue (titulos) + DM Sans (corpo)
- Animacoes fade-in no scroll (IntersectionObserver)
- Responsivo (breakpoint 900px)

Novas paginas (projeto, blog, post) seguem o mesmo design system.
