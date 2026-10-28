-- Fase 3: quadro Kanban (sincronização com Supabase + localStorage como cache offline).
-- A frontend espelha as alterações do Kanban nesta tabela quando há conexão
-- e busca o estado remoto na inicialização; sem conexão, o localStorage é usado.

create table if not exists kanban_cards (
  id text primary key,
  title text not null,
  status text not null,
  column_id text not null,
  position int not null default 0,
  updated_at timestamptz not null default now(),
  category text
);

-- Índice para buscar o estado do quadro ordenado por coluna/posição.
create index if not exists idx_kanban_cards_column_position on kanban_cards (column_id, position);
