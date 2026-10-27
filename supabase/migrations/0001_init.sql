--enable-pgvector: 'true'

create table decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  tag text,
  created_at timestamptz not null default now()
);

create table cards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references decks on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  card_code text not null,
  front_text text not null,
  back_text text not null,
  front_image_path text,
  back_image_path text,
  created_at timestamptz not null default now(),
  unique (deck_id, card_code)
);

alter table decks enable row level security;
alter table cards enable row level security;

create policy "Users can manage their own decks"
  on decks
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own cards"
  on cards
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.next_card_code(deck_id_param uuid)
returns text
language plpgsql
as $$
declare
  max_code text;
begin
  select max(card_code) into max_code from cards where deck_id = deck_id_param;
  if max_code is null then
    return '1';
  else
    return (max_code::int + 1)::text;
  end if;
end;
$$;

insert into storage.buckets (id, name, public)
values ('card-images', 'card-images', false)
on conflict (id) do nothing;

create policy "Users can upload images to their own folder"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'card-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read images from their own folder"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'card-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update images in their own folder"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'card-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'card-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete images in their own folder"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'card-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
