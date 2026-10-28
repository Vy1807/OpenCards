-- Fase 3: perfis de usuario (dados complementares ao auth.users do Supabase Auth)

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users on delete cascade,
  nome text not null,
  cpf text,
  telefone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Usuarios gerenciam seu proprio perfil"
  on profiles
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
