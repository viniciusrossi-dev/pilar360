# Arquitetura do Site Pilar360

Este documento descreve a arquitetura completa do site institucional da Pilar360 Incorporadora. Destina-se a desenvolvedores que precisam entender o sistema sem precisar inspecionar cada arquivo individualmente.

---

## Visão Geral

O site da Pilar360 é um site institucional estático multi-página (MPA) construído com Vite. Não há framework de front-end — todo o HTML é escrito diretamente nos arquivos `.html` e o JavaScript usa ES Modules nativos. O backend é composto exclusivamente pelo Supabase (banco de dados PostgreSQL + Auth + Storage). Há um painel administrativo protegido por autenticação Supabase que permite gerenciar projetos, blog e visualizar mensagens de contato.

---

## Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| Build Tool | Vite 6 |
| Linguagem | JavaScript (ES Modules, sem TypeScript) |
| HTML | Arquivos `.html` estáticos multi-página |
| CSS | CSS puro com variáveis (`--var`) |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação admin | Supabase Auth (email + senha) |
| Storage de arquivos | Supabase Storage (bucket `pilar360`) |
| Editor de texto rico | Quill 2 (painel admin — blog) |
| Formulário de contato | Formspree + Supabase (dual-write) |
| Hospedagem | Netlify |
| Fontes | Google Fonts — Bebas Neue + DM Sans |

---

## Estrutura de Diretórios

```
pilar360/
├── index.html                   # Home page (landing institucional)
├── projeto.html                 # Detalhe de empreendimento (dinâmico via query string)
├── blog.html                    # Listagem do blog
├── post.html                    # Detalhe de post (dinâmico via query string)
├── vite.config.js               # Configuração Vite — entrada multi-página
├── package.json                 # Dependências: @supabase/supabase-js, quill
├── netlify.toml                 # Configuração de build e redirects Netlify
│
├── admin/
│   ├── index.html               # Login do painel admin
│   ├── dashboard.html           # Dashboard — mensagens e stats
│   ├── projetos.html            # CRUD de empreendimentos
│   └── blog.html                # CRUD de posts do blog
│
├── src/
│   ├── css/
│   │   ├── style.css            # Design system do site público
│   │   └── admin.css            # Design system do painel admin
│   └── js/
│       ├── supabase.js          # Instância do cliente Supabase (singleton)
│       ├── header.js            # Componente de navegação (renderHeader)
│       ├── footer.js            # Componente de rodapé (renderFooter)
│       ├── auth.js              # Guard de autenticação admin (requireAuth, getSession, signOut)
│       ├── main.js              # Ponto de entrada da home (header, footer, form, blog preview, fade-in)
│       ├── formspree.js         # Lógica de envio do formulário de contato
│       ├── projeto.js           # Lógica da página de detalhe do empreendimento
│       ├── blog.js              # Listagem do blog com filtros e paginação
│       ├── post.js              # Detalhe do post e posts relacionados
│       ├── admin-login.js       # Autenticação do painel admin
│       ├── admin-layout.js      # Sidebar e estrutura do painel admin
│       ├── admin-dashboard.js   # Dashboard — stats e gerenciamento de mensagens
│       ├── admin-projetos.js    # CRUD completo de empreendimentos e sub-seções
│       └── admin-blog.js        # CRUD completo de posts com editor Quill
│
├── imagens/
│   ├── logo.svg                 # Logo da Pilar360
│   ├── aloha-dia.jpg            # Foto do Residencial Aloha (dia)
│   ├── aloha-noite.jpg          # Foto do Residencial Aloha (noite — usada no hero)
│   └── sunset.jpg               # Foto do Residencial Sunset
│
├── docs/
│   └── ARCHITECTURE.md          # Este documento
│
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql  # Schema inicial do banco de dados
```

---

## Frontend

### Vite — Configuração Multi-página

O Vite é configurado em `vite.config.js` como um build multi-página. Cada arquivo HTML é um entry point independente:

- `index` → `index.html`
- `projeto` → `projeto.html`
- `blog` → `blog.html`
- `post` → `post.html`
- `admin/index` → `admin/index.html`
- `admin/dashboard` → `admin/dashboard.html`
- `admin/projetos` → `admin/projetos.html`
- `admin/blog` → `admin/blog.html`

O target de build é `esnext`. O Rollup (bundler interno do Vite) processa cada entrada de forma independente. O output vai para o diretório `dist/`, que é publicado pelo Netlify.

### Design System — Site Público (`src/css/style.css`)

O site público usa tema escuro. As variáveis CSS definidas em `:root`:

| Variável | Valor | Uso |
|----------|-------|-----|
| `--verde` | `#7AB648` | Cor primária — botões, destaques, links hover |
| `--preto` | `#0A0A0A` | Background principal |
| `--cinza-escuro` | `#111111` | Background de seções alternadas |
| `--cinza-medio` | `#1A1A1A` | Cards e superfícies |
| `--cinza-claro` | `#2A2A2A` | Bordas e separadores |
| `--branco` | `#F5F5F0` | Texto principal |
| `--branco-suave` | `rgba(245,245,240,0.7)` | Texto secundário |

Fontes: `Bebas Neue` (títulos de impacto) + `DM Sans` (corpo de texto — pesos 300, 400, 500, 700).

Classes de botão principais:
- `.btn-primary` — fundo verde, texto preto, uppercase
- `.btn-outline` — borda verde transparente, texto branco

A classe `.fade-in` + `.visible` controla animações de entrada via `IntersectionObserver`.

### Design System — Painel Admin (`src/css/admin.css`)

O painel admin usa tema claro. Variáveis CSS em `:root`:

| Variável | Valor | Uso |
|----------|-------|-----|
| `--admin-bg` | `#f5f5f5` | Background geral |
| `--admin-card` | `#ffffff` | Superfícies de cards e formulários |
| `--admin-border` | `#e0e0e0` | Bordas |
| `--admin-text` | `#1a1a1a` | Texto principal |
| `--admin-muted` | `#666` | Texto secundário |
| `--admin-verde` | `#7AB648` | Cor de ação (mesma do site público) |
| `--admin-verde-dark` | `#5e9035` | Verde em hover |
| `--admin-danger` | `#ef4444` | Botão de exclusão |
| `--admin-danger-dark` | `#dc2626` | Danger em hover |
| `--admin-sidebar-w` | `240px` | Largura da sidebar |

Fonte: `DM Sans` (mesma do site público, apenas sem Bebas Neue).

---

## Módulos Compartilhados

### `src/js/supabase.js`

Cria e exporta a instância única do cliente Supabase. Lê as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` via `import.meta.env`. Todos os outros módulos importam `{ supabase }` deste arquivo.

### `src/js/header.js`

Exporta `renderHeader()`. Injeta o HTML da `<nav>` no elemento `#site-header`. Inclui:
- Logo com link para `/`
- Links: Sobre, Projetos, Blog, Nossa Essência, Falar com a gente (CTA)
- Botão hamburger para mobile com toggle `.nav-open` + controle `aria-expanded`
- `scroll` listener que aumenta a opacidade do fundo da nav após 50px de scroll

### `src/js/footer.js`

Exporta `renderFooter()`. Injeta o `<footer>` no elemento `#site-footer` com logo, tagline e copyright dinâmico (`new Date().getFullYear()`).

### `src/js/auth.js`

Exporta três funções para controle de sessão do painel admin:
- `requireAuth()` — verifica sessão ativa; se inexistente, redireciona para `/admin/index.html` e retorna `null`
- `getSession()` — retorna a sessão atual sem redirecionar
- `signOut()` — faz logout e redireciona para `/admin/index.html`

### `src/js/admin-layout.js`

Exporta `renderAdminLayout(activePage)`. Recebe o conteúdo atual do `#admin-layout`, envolve com a sidebar e coloca o conteúdo original dentro de `<main class="admin-main">`. A sidebar contém: logo, links de navegação (Dashboard, Projetos, Blog, Ver site), botão Sair. O link ativo recebe a classe `active` com base no parâmetro `activePage`.

---

## Páginas Públicas

### Home (`index.html` + `src/js/main.js`)

Página única com todas as seções da landing institucional, montadas diretamente no HTML:

1. **Hero** — imagem do Residencial Aloha, título, subtítulo, CTAs para `#projetos` e `#contato`
2. **Numeros** — 4 stats: 2 empreendimentos, 17 unidades, RS, MCMV
3. **Sobre** — texto institucional, grid de valores (Inovação, Qualidade, Compromisso, Parceria), cards de Missão e Visão
4. **Projetos** — cards hardcoded para Residencial Aloha, Residencial Sunset e "Próximo Projeto"; links para `/projeto.html?id=<slug>`
5. **MVV** — seção Missão/Visão/Valores textual
6. **Blog Preview** — grid carregado dinamicamente do Supabase (tabela `blog_post`, 3 posts mais recentes publicados)
7. **Contato** — formulário de contato + informações de contato

O `main.js` inicializa: `renderHeader()`, `renderFooter()`, `initContactForm()`, `IntersectionObserver` para `.fade-in` e a função `loadBlogPreview()`.

### Detalhe de Projeto (`projeto.html` + `src/js/projeto.js`)

Página dinâmica. O slug é lido do parâmetro `?id=` na query string. O `projeto.js` faz queries paralelas ao Supabase para carregar:

- `projeto` — dados do empreendimento (por `slug`)
- `projeto_imagem` — galeria de fotos (ordenada por `sort_order`)
- `projeto_unidade` — tabela de unidades (ordenada por `andar`)
- `projeto_update` — timeline de obra (ordenada por `data` decrescente)

As seções são renderizadas como strings HTML e injetadas em `#projeto-content`:

1. **Hero** — imagem de capa como `background-image`, badge de status, título, localização
2. **Specs Bar** — 4 cards: unidades, metragem, entrega, valor base
3. **Descrição + Galeria** — texto descritivo, diferenciais (lista), galeria de fotos com lightbox
4. **Planta** — imagem da planta com lightbox (condicional — só aparece se `imagem_planta` existir)
5. **Tabela de Unidades** — tabela HTML com status colorido: disponivel (verde), reservada (amarelo), vendida (vermelho)
6. **Simulador MCMV** — formulário de simulação (ver seção dedicada abaixo)
7. **Timeline de Obra** — cards cronológicos com foto opcional e lightbox
8. **CTA** — links para WhatsApp e formulário de contato

As meta tags Open Graph (`og:title`, `og:description`, `og:image`) são atualizadas dinamicamente com os dados do projeto.

O **lightbox** é criado via `initLightbox()` — um overlay DOM injetado uma vez, reutilizado por todos os elementos com `data-lightbox`. Fecha com clique fora ou tecla Escape.

### Blog — Listagem (`blog.html` + `src/js/blog.js`)

Listagem paginada de posts. Funcionalidades:

- **Filtro por categoria** — botões: Todos, Empresa, Mercado, Dicas. Ao clicar, recarrega do início com `reset=true`
- **Paginação** — page size de 20 posts; botão "Carregar mais" aparece enquanto houver mais posts
- Query usa `count: 'exact'` para saber o total e controlar a visibilidade do botão
- Cards são elementos `<a>` com imagem, categoria, título, resumo e data; link para `/post.html?slug=<slug>`

### Detalhe de Post (`post.html` + `src/js/post.js`)

Slug lido do parâmetro `?slug=`. Se ausente, redireciona para `/blog.html`. Busca apenas posts com `publicado = true`. Renderiza:

- Hero com imagem de capa (ou espaçador)
- Artigo com categoria, título, data, conteúdo HTML (campo `conteudo` renderizado como innerHTML)
- Botões de compartilhamento: WhatsApp e "Copiar link" (Clipboard API)
- CTA para `/#projetos`
- Seção "Leia também" — até 3 posts da mesma categoria (excluindo o atual)

Meta tags Open Graph atualizadas dinamicamente.

---

## Formulário de Contato (`src/js/formspree.js`)

O formulário de contato envia os dados para dois destinos simultaneamente usando `Promise.allSettled`:

1. **Supabase** — INSERT na tabela `contato_mensagem`
2. **Formspree** — POST para `https://formspree.io/f/${FORMSPREE_ID}` (variável `VITE_FORMSPREE_ID`)

A submissão é considerada bem-sucedida se **ao menos um** dos dois envios tiver êxito. Isso garante redundância: se o Supabase estiver fora, o Formspree recebe; e vice-versa. Campos coletados: nome, telefone, email, perfil (select), mensagem.

Feedback visual é exibido via elemento `.form-feedback` inserido dinamicamente no final do form, removido após 6 segundos.

---

## Simulador MCMV (`src/js/projeto.js` — `initSimulator`)

Embutido na página de detalhe de projeto. Implementa a lógica de enquadramento do programa Minha Casa Minha Vida:

| Faixa | Renda Familiar (R$) | Subsídio máximo | % subsídio | Juros a.a. |
|-------|---------------------|-----------------|-----------|-----------|
| Faixa 1 | até 2.640 | R$ 55.000 | 50% | 4% |
| Faixa 2 | até 4.400 | R$ 35.000 | 25% | 5,5% |
| Faixa 3 | até 8.000 | — | 0% | 7,5% |
| Acima do limite | > 8.000 | — | 0% | 9% |

Cálculo da parcela: sistema Price (tabela Price / SAC simplificado com parcela constante):

```
parcela = PV × (i × (1 + i)^n) / ((1 + i)^n − 1)
```

Onde `i = taxaAnual / 12 / 100` e `n = 420` meses (35 anos).

A entrada assumida é de 20% sobre o valor financiado (valor do imóvel menos o subsídio).

O resultado exibe enquadramento, subsídio estimado, valor da entrada, parcela estimada, percentual da renda comprometido e um botão de WhatsApp com a simulação pré-preenchida na mensagem.

---

## Painel Administrativo

O painel admin é um SPA simulado dentro do Vite MPA — cada página HTML carrega um módulo JS que troca o conteúdo do container dinamicamente entre lista e formulário, sem navegação de página. A sidebar é injetada por `renderAdminLayout()` ao redor do conteúdo existente no `#admin-layout`.

### Autenticação (`admin/index.html` + `src/js/admin-login.js`)

- Usa `supabase.auth.signInWithPassword({ email, password })`
- Ao carregar, verifica sessão existente (`getSession`): se já autenticado, redireciona direto para `dashboard.html`
- Credenciais inválidas exibem mensagem de erro inline
- Após login bem-sucedido, redireciona para `dashboard.html`

Todas as páginas protegidas chamam `requireAuth()` no topo do módulo. Se não houver sessão, o redirecionamento para o login ocorre antes de qualquer renderização.

### Dashboard (`admin/dashboard.html` + `src/js/admin-dashboard.js`)

Exibe três stats em paralelo via `Promise.all`:
- Mensagens não lidas (`contato_mensagem` com `lido = false`)
- Posts publicados (`blog_post` com `publicado = true`)
- Unidades disponíveis (`projeto_unidade` com `status = 'disponivel'`)

Abaixo das stats, lista todas as mensagens de contato em ordem decrescente de criação. Cada item é colapsável (clique no header expande o detalhe). Funcionalidades:
- Filtro Todas / Não lidas
- Botão "Marcar como lida" — UPDATE em `contato_mensagem` + recarrega stats e lista

### Projetos — CRUD (`admin/projetos.html` + `src/js/admin-projetos.js`)

O módulo alterna entre duas views sem recarregar a página:

**Lista (`showList`):** Tabela de projetos com nome, slug, status e número de unidades. Botão "Editar" abre o formulário.

**Formulário (`showForm`):** Campos do empreendimento:
- Nome, Slug (auto-gerado do nome em novos projetos)
- Status (Em Construção / Em fase final / Entregue)
- Localização, Descrição
- Tipologia, Metragem, Total de Unidades
- Data de Entrega, Valor Base, Ordem de Exibição
- Imagem de Capa — URL manual ou upload para Supabase Storage (bucket `pilar360`, path `projetos/capas/`)

Ao editar um projeto existente, renderiza quatro sub-seções adicionais:
- **Galeria** — lista de imagens com upload e remoção
- **Planta** — imagem da planta com upload
- **Unidades** — tabela de unidades com formulário inline de adição/edição/remoção (campos: identificador, tipologia, metragem, valor, status, andar, observação)
- **Atualizações de Obra** — timeline com formulário de adição/remoção (campos: título, descrição, data, foto)

### Blog — CRUD (`admin/blog.html` + `src/js/admin-blog.js`)

**Lista (`showList`):** Tabela de posts com título, slug, categoria, status (Publicado/Rascunho) e data. Botões Editar e Excluir por linha.

**Formulário (`showForm`):** Campos:
- Título (obrigatório)
- Slug (auto-gerado do título em posts novos via `toSlug()`)
- Categoria (empresa / mercado / dicas)
- Imagem de Capa — URL manual ou upload para Supabase Storage (bucket `pilar360`, path `blog/`)
- Resumo (texto simples — aparece nas listagens)
- Conteúdo (editor Quill com toolbar: cabeçalhos H2/H3, bold/italic/underline, listas, link, imagem, limpar)
- Checkbox "Publicado"

Lógica de `publicado_em`:
- Ao publicar pela primeira vez: define `publicado_em = new Date().toISOString()`
- Ao despublicar: define `publicado_em = null`
- Se já estava publicado e permanece publicado: mantém `publicado_em` original

Há um modal de preview inline que renderiza o post (título, imagem, conteúdo) em um overlay antes de salvar.

A `<link>` do CSS do Quill Snow é carregada via CDN no `admin/blog.html`.

---

## Backend (Supabase)

### Banco de Dados

#### Tabela `projeto`

Representa os empreendimentos imobiliários.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | serial PK | Identificador |
| `nome` | text | Nome do empreendimento |
| `slug` | text UNIQUE | Identificador de URL |
| `localizacao` | text | Localização textual |
| `descricao` | text | Descrição longa |
| `status` | text | Estado da obra (default: 'Em Construção') |
| `tipologia` | text | Tipos de unidade (ex: "2 e 3 quartos") |
| `metragem` | text | Faixa de metragem |
| `total_unidades` | int | Total de unidades do empreendimento |
| `data_entrega` | text | Data prevista (texto livre) |
| `valor_base` | numeric | Valor de referência para simulação |
| `latitude` / `longitude` | numeric | Coordenadas geográficas |
| `planta_url` | text | URL da imagem da planta |
| `imagem_capa_url` | text | URL da imagem de capa |
| `sort_order` | int | Ordem de exibição (default: 0) |
| `ativo` | boolean | Se aparece no site (default: true) |
| `created_at` | timestamptz | Data de criação |

#### Tabela `projeto_imagem`

Galeria de fotos de cada empreendimento.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | serial PK | |
| `projeto_id` | int FK | Referência para `projeto.id` (CASCADE DELETE) |
| `url` | text | URL pública da imagem |
| `legenda` | text | Legenda opcional |
| `sort_order` | int | Ordem na galeria |

#### Tabela `projeto_unidade`

Unidades individuais de cada empreendimento.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | serial PK | |
| `projeto_id` | int FK | Referência para `projeto.id` (CASCADE DELETE) |
| `identificador` | text | Nome/número da unidade |
| `tipologia` | text | Ex: 2 quartos |
| `metragem` | numeric | Metragem em m² |
| `valor` | numeric | Preço de venda |
| `status` | text | disponivel / reservada / vendida (default: 'disponivel') |
| `andar` | text | Andar da unidade |
| `observacao` | text | Observações adicionais |
| `updated_at` | timestamptz | Última atualização |

#### Tabela `projeto_update`

Timeline de atualizações de obra.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | serial PK | |
| `projeto_id` | int FK | Referência para `projeto.id` (CASCADE DELETE) |
| `titulo` | text | Título da atualização |
| `descricao` | text | Descrição detalhada |
| `imagem_url` | text | Foto de obra opcional |
| `data` | date | Data da atualização |
| `created_at` | timestamptz | Data de inserção |

#### Tabela `blog_post`

Posts do blog.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | serial PK | |
| `titulo` | text | Título do post |
| `slug` | text UNIQUE | Identificador de URL |
| `resumo` | text | Resumo (aparece nas listagens) |
| `conteudo` | text | HTML gerado pelo Quill |
| `categoria` | text | empresa / mercado / dicas (default: 'empresa') |
| `imagem_capa_url` | text | URL da imagem de capa |
| `publicado` | boolean | Visibilidade pública (default: false) |
| `publicado_em` | timestamptz | Data de publicação (definida ao publicar) |
| `created_at` | timestamptz | Data de criação |
| `updated_at` | timestamptz | Data de última modificação |

#### Tabela `contato_mensagem`

Mensagens recebidas pelo formulário de contato.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | serial PK | |
| `nome` | text | Nome do remetente |
| `telefone` | text | Telefone (opcional) |
| `email` | text | E-mail do remetente |
| `perfil` | text | Comprador / Corretor / Investidor / etc. |
| `mensagem` | text | Texto da mensagem |
| `lido` | boolean | Flag de leitura pelo admin (default: false) |
| `created_at` | timestamptz | Data de envio |

### RLS Policies (Row Level Security)

RLS habilitada em todas as tabelas. A regra geral:

| Tabela | Leitura anon | Escrita anon | Leitura auth | Escrita auth |
|--------|-------------|-------------|--------------|--------------|
| `projeto` | sim | nao | sim | sim |
| `projeto_imagem` | sim | nao | sim | sim |
| `projeto_unidade` | sim | nao | sim | sim |
| `projeto_update` | sim | nao | sim | sim |
| `blog_post` | apenas publicados | nao | todos | sim |
| `contato_mensagem` | nao | sim (INSERT) | sim | sim (UPDATE) |

Para `blog_post`, a policy `blog_post_select_public` filtra `publicado = true` para o role `anon`. O role `authenticated` acessa todos os posts (incluindo rascunhos) via `blog_post_select_admin`.

Para `contato_mensagem`, o role `anon` pode apenas INSERT (enviar mensagem). O role `authenticated` pode SELECT e UPDATE (ler e marcar como lida).

### Storage

Bucket único: `pilar360`. Paths utilizados:

| Path | Conteúdo |
|------|---------|
| `blog/` | Imagens de capa dos posts do blog |
| `projetos/capas/` | Imagens de capa dos empreendimentos |

O upload é feito com `upsert: true`. Após o upload, obtém-se a URL pública via `supabase.storage.from('pilar360').getPublicUrl(path)`.

### Autenticação Admin

Usa Supabase Auth com `signInWithPassword`. O painel admin não tem registro público — as credenciais de admin são criadas diretamente pelo Supabase Dashboard. A sessão é gerenciada pelo SDK do Supabase (localStorage).

---

## Hosting e Deploy (Netlify)

Configuração em `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/admin/*"
  to = "/admin/:splat"
  status = 200
```

O comando de build é `vite build`. O output vai para `dist/`. O redirect `status = 200` para `/admin/*` garante que o Netlify sirva os arquivos do diretório `admin/` corretamente sem gerar 404 nas rotas.

### Variáveis de Ambiente

Configuradas no painel Netlify (e localmente em `.env`):

| Variável | Descrição |
|----------|-----------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave anon pública do Supabase |
| `VITE_FORMSPREE_ID` | ID do endpoint Formspree para o formulário de contato |

O prefixo `VITE_` é obrigatório para que o Vite exponha as variáveis em `import.meta.env`.

---

## Convenções de Código

### Importações

Todos os módulos JS usam ES Modules nativos (`import`/`export`). As páginas HTML referenciam os módulos com `<script type="module" src="/src/js/<modulo>.js">`. Não há bundling de JS — o Vite injeta os scripts processados via Rollup no build final.

### Padrão de Renderização

Nenhuma página usa framework — toda renderização é feita via template literals injetados em `element.innerHTML`. O padrão é:

1. Verificar sessão/auth se necessário
2. Montar layout (header, footer, admin-layout)
3. Fazer queries ao Supabase
4. Construir HTML como string
5. Injetar em container
6. Adicionar event listeners após a injeção

### CSS

- Sem preprocessadores — CSS puro com variáveis customizadas (`--var`)
- Cada página pública usa `/src/css/style.css`; páginas admin usam `/src/css/admin.css` (temas independentes)
- Animações de entrada: classe `.fade-in` + `IntersectionObserver` que adiciona `.visible`

### Segurança

- Todas as strings de usuário exibidas no admin passam por `escHtml()` (escape manual de `&`, `<`, `>`, `"`, `'`) para prevenir XSS
- O conteúdo dos posts do blog (campo `conteudo`) é renderizado como `innerHTML` — é HTML confiável gerado pelo Quill no painel admin autenticado

### Git

O repositório está em `C:\Users\vinic\pilar360`. Branch principal: `main`.

Convenção de commit:
```
NOME | ACTION:descrição do que foi feito
```

Exemplos:
```
Vini | feat:adiciona simulador MCMV na página de projeto
Vini | fix:corrige filtro de categoria no blog
Vini | docs:documento de arquitetura completo do site Pilar360
```
