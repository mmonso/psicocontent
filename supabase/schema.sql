-- =============================================================================
-- PsicoContent Studio — schema do Supabase
--
-- Como aplicar:
--   1. Crie um projeto em https://supabase.com/dashboard
--   2. Abra o SQL Editor do projeto
--   3. Cole este arquivo inteiro e execute
--   4. Em Project Settings > API, copie a Project URL e a chave anon/public
--      para o seu .env (veja .env.example)
--
-- O artigo inteiro é guardado em JSONB. A estrutura tem partes opcionais e
-- aninhadas (rascunho, revisão, capa, formatos derivados) que mudam conforme o
-- produto evolui; normalizar tudo em colunas obrigaria a uma migração a cada
-- ajuste. As colunas soltas ao lado existem só para ordenar, filtrar e buscar
-- sem precisar abrir o JSON.
-- =============================================================================

-- Artigos -------------------------------------------------------------------

create table if not exists public.artigos (
  id             text primary key,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now(),
  topico         text        not null default '',
  titulo         text        not null default '',
  status         text        not null default 'completed',
  dados          jsonb       not null
);

create index if not exists artigos_atualizado_em_idx
  on public.artigos (atualizado_em desc);

create index if not exists artigos_status_idx
  on public.artigos (status);

-- Manifesto -----------------------------------------------------------------
-- Linha única: a voz e os princípios do autor. O id fixo em 'singleton'
-- garante que um upsert sempre sobrescreva a mesma linha.

create table if not exists public.manifesto (
  id             text primary key default 'singleton',
  atualizado_em  timestamptz not null default now(),
  dados          jsonb       not null
);

-- =============================================================================
-- Segurança (RLS)
--
-- ATENÇÃO — configuração atual: ESCRITA ABERTA.
-- A chave anon fica visível no JavaScript entregue ao navegador. Com as
-- políticas abaixo, qualquer pessoa que tenha a URL do projeto e essa chave
-- pode ler, alterar e APAGAR toda a biblioteca. Isso é aceitável apenas
-- enquanto o app rodar somente na sua máquina e a URL não for divulgada.
--
-- Antes de publicar em qualquer lugar acessível pela internet, troque pelas
-- políticas do bloco "VERSÃO PROTEGIDA" no final deste arquivo.
-- =============================================================================

alter table public.artigos   enable row level security;
alter table public.manifesto enable row level security;

drop policy if exists artigos_acesso_aberto   on public.artigos;
drop policy if exists manifesto_acesso_aberto on public.manifesto;

create policy artigos_acesso_aberto
  on public.artigos
  for all
  using (true)
  with check (true);

create policy manifesto_acesso_aberto
  on public.manifesto
  for all
  using (true)
  with check (true);

-- =============================================================================
-- VERSÃO PROTEGIDA — leitura pública, escrita só do dono autenticado.
--
-- Para migrar: ative o Supabase Auth (e-mail), crie seu usuário, e então
-- execute o bloco abaixo. Ele remove as políticas abertas e passa a exigir
-- sessão autenticada para qualquer escrita, mantendo o Portal Público legível
-- por qualquer visitante.
--
--   drop policy if exists artigos_acesso_aberto   on public.artigos;
--   drop policy if exists manifesto_acesso_aberto on public.manifesto;
--
--   create policy artigos_leitura_publica
--     on public.artigos for select using (true);
--
--   create policy artigos_escrita_autenticada
--     on public.artigos for all
--     using (auth.role() = 'authenticated')
--     with check (auth.role() = 'authenticated');
--
--   create policy manifesto_leitura_publica
--     on public.manifesto for select using (true);
--
--   create policy manifesto_escrita_autenticada
--     on public.manifesto for all
--     using (auth.role() = 'authenticated')
--     with check (auth.role() = 'authenticated');
-- =============================================================================
