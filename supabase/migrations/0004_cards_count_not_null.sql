-- Sprint 2: tornar cards_count NOT NULL DEFAULT 0 em decks
-- A coluna já existe com default 0, mas é nullable; tornamos obrigatória.

-- Primeiro, atualiza valores NULL existentes para 0 (se houver)
update decks
set cards_count = 0
where cards_count is null;

-- Altera a coluna para NOT NULL com default 0
alter table decks
alter column cards_count set not null,
alter column cards_count set default 0;