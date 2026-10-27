-- Fase 2: repetição espaçada (Leitner) e log de revisões

-- Colunas novas em cards
alter table cards
  add column if not exists box smallint not null default 0,            -- caixa de Leitner 0..5
  add column if not exists due_at timestamptz not null default now(),  -- próxima revisão
  add column if not exists review_count int not null default 0,
  add column if not exists last_reviewed_at timestamptz;

-- Índice para consultas de cartões pendentes (devido agora)
create index if not exists idx_cards_due_at on cards (deck_id, due_at);

-- Tabela de log de revisões
create table if not exists review_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  card_id uuid not null references cards on delete cascade,
  deck_id uuid not null references decks on delete cascade,
  correct boolean not null,
  reviewed_at timestamptz not null default now()
);

-- RLS em review_log
alter table review_log enable row level security;

create policy "Users can manage their own review_log"
  on review_log
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Índice para calcular streak por usuário/dia
create index if not exists idx_review_log_user_date on review_log (user_id, reviewed_at);
