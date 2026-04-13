-- ============================================
-- Pilar360 Site — Initial Schema
-- ============================================

-- Projeto (empreendimento)
CREATE TABLE projeto (
  id serial PRIMARY KEY,
  nome text NOT NULL,
  slug text UNIQUE NOT NULL,
  localizacao text,
  descricao text,
  status text DEFAULT 'Em Construção',
  tipologia text,
  metragem text,
  total_unidades int,
  data_entrega text,
  valor_base numeric,
  latitude numeric,
  longitude numeric,
  planta_url text,
  imagem_capa_url text,
  sort_order int DEFAULT 0,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Imagens do projeto (galeria)
CREATE TABLE projeto_imagem (
  id serial PRIMARY KEY,
  projeto_id int REFERENCES projeto(id) ON DELETE CASCADE,
  url text NOT NULL,
  legenda text,
  sort_order int DEFAULT 0
);

-- Unidades do projeto
CREATE TABLE projeto_unidade (
  id serial PRIMARY KEY,
  projeto_id int REFERENCES projeto(id) ON DELETE CASCADE,
  identificador text NOT NULL,
  tipologia text,
  metragem numeric,
  valor numeric,
  status text DEFAULT 'disponivel',
  andar text,
  observacao text,
  updated_at timestamptz DEFAULT now()
);

-- Updates de obra (timeline)
CREATE TABLE projeto_update (
  id serial PRIMARY KEY,
  projeto_id int REFERENCES projeto(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao text,
  imagem_url text,
  data date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Blog posts
CREATE TABLE blog_post (
  id serial PRIMARY KEY,
  titulo text NOT NULL,
  slug text UNIQUE NOT NULL,
  resumo text,
  conteudo text,
  categoria text DEFAULT 'empresa',
  imagem_capa_url text,
  publicado boolean DEFAULT false,
  publicado_em timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Mensagens de contato
CREATE TABLE contato_mensagem (
  id serial PRIMARY KEY,
  nome text NOT NULL,
  telefone text,
  email text NOT NULL,
  perfil text,
  mensagem text NOT NULL,
  lido boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE projeto ENABLE ROW LEVEL SECURITY;
ALTER TABLE projeto_imagem ENABLE ROW LEVEL SECURITY;
ALTER TABLE projeto_unidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE projeto_update ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post ENABLE ROW LEVEL SECURITY;
ALTER TABLE contato_mensagem ENABLE ROW LEVEL SECURITY;

-- Projeto: public read, authenticated write
CREATE POLICY "projeto_select" ON projeto FOR SELECT USING (true);
CREATE POLICY "projeto_insert" ON projeto FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "projeto_update" ON projeto FOR UPDATE TO authenticated USING (true);
CREATE POLICY "projeto_delete" ON projeto FOR DELETE TO authenticated USING (true);

-- Projeto imagem: public read, authenticated write
CREATE POLICY "projeto_imagem_select" ON projeto_imagem FOR SELECT USING (true);
CREATE POLICY "projeto_imagem_insert" ON projeto_imagem FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "projeto_imagem_update" ON projeto_imagem FOR UPDATE TO authenticated USING (true);
CREATE POLICY "projeto_imagem_delete" ON projeto_imagem FOR DELETE TO authenticated USING (true);

-- Projeto unidade: public read, authenticated write
CREATE POLICY "projeto_unidade_select" ON projeto_unidade FOR SELECT USING (true);
CREATE POLICY "projeto_unidade_insert" ON projeto_unidade FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "projeto_unidade_update" ON projeto_unidade FOR UPDATE TO authenticated USING (true);
CREATE POLICY "projeto_unidade_delete" ON projeto_unidade FOR DELETE TO authenticated USING (true);

-- Projeto update: public read, authenticated write
CREATE POLICY "projeto_update_select" ON projeto_update FOR SELECT USING (true);
CREATE POLICY "projeto_update_insert" ON projeto_update FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "projeto_update_update" ON projeto_update FOR UPDATE TO authenticated USING (true);
CREATE POLICY "projeto_update_delete" ON projeto_update FOR DELETE TO authenticated USING (true);

-- Blog: anon sees only published, authenticated sees all
CREATE POLICY "blog_post_select_public" ON blog_post FOR SELECT TO anon USING (publicado = true);
CREATE POLICY "blog_post_select_admin" ON blog_post FOR SELECT TO authenticated USING (true);
CREATE POLICY "blog_post_insert" ON blog_post FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "blog_post_update" ON blog_post FOR UPDATE TO authenticated USING (true);
CREATE POLICY "blog_post_delete" ON blog_post FOR DELETE TO authenticated USING (true);

-- Contato: anon can insert, authenticated can read/update
CREATE POLICY "contato_insert" ON contato_mensagem FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "contato_select" ON contato_mensagem FOR SELECT TO authenticated USING (true);
CREATE POLICY "contato_update" ON contato_mensagem FOR UPDATE TO authenticated USING (true);
