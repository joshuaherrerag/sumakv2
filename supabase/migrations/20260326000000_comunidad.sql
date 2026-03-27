-- =============================================
-- MIGRACIÓN: Sistema de Comunidad
-- Tablas: posts, post_reacciones, post_comentarios, seguimientos
-- =============================================

-- Posts
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  autor_id    uuid not null references public.profiles(id) on delete cascade,
  contenido   text not null,
  imagen_url  text,
  created_at  timestamptz not null default now()
);

-- Reacciones (una por usuario por post)
create table if not exists public.post_reacciones (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  usuario_id  uuid not null references public.profiles(id) on delete cascade,
  tipo        text not null check (tipo in ('like', 'love', 'fire')),
  created_at  timestamptz not null default now(),
  unique (post_id, usuario_id)
);

-- Comentarios
create table if not exists public.post_comentarios (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  autor_id    uuid not null references public.profiles(id) on delete cascade,
  contenido   text not null,
  created_at  timestamptz not null default now()
);

-- Seguimientos entre perfiles
create table if not exists public.seguimientos (
  id          uuid primary key default gen_random_uuid(),
  seguidor_id uuid not null references public.profiles(id) on delete cascade,
  seguido_id  uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (seguidor_id, seguido_id),
  check (seguidor_id <> seguido_id)
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table public.posts enable row level security;
alter table public.post_reacciones enable row level security;
alter table public.post_comentarios enable row level security;
alter table public.seguimientos enable row level security;

-- Posts: lectura pública, escritura autenticada
create policy "posts_select" on public.posts for select using (true);
create policy "posts_insert" on public.posts for insert with check (
  autor_id = (select id from public.profiles where user_id = auth.uid())
);
create policy "posts_delete" on public.posts for delete using (
  autor_id = (select id from public.profiles where user_id = auth.uid())
);

-- Reacciones
create policy "reacciones_select" on public.post_reacciones for select using (true);
create policy "reacciones_insert" on public.post_reacciones for insert with check (
  usuario_id = (select id from public.profiles where user_id = auth.uid())
);
create policy "reacciones_delete" on public.post_reacciones for delete using (
  usuario_id = (select id from public.profiles where user_id = auth.uid())
);

-- Comentarios
create policy "comentarios_select" on public.post_comentarios for select using (true);
create policy "comentarios_insert" on public.post_comentarios for insert with check (
  autor_id = (select id from public.profiles where user_id = auth.uid())
);
create policy "comentarios_delete" on public.post_comentarios for delete using (
  autor_id = (select id from public.profiles where user_id = auth.uid())
);

-- Seguimientos
create policy "seguimientos_select" on public.seguimientos for select using (true);
create policy "seguimientos_insert" on public.seguimientos for insert with check (
  seguidor_id = (select id from public.profiles where user_id = auth.uid())
);
create policy "seguimientos_delete" on public.seguimientos for delete using (
  seguidor_id = (select id from public.profiles where user_id = auth.uid())
);

-- =============================================
-- STORAGE BUCKET: posts-media
-- =============================================

insert into storage.buckets (id, name, public)
  values ('posts-media', 'posts-media', true)
  on conflict (id) do nothing;

create policy "posts_media_select" on storage.objects
  for select using (bucket_id = 'posts-media');

create policy "posts_media_insert" on storage.objects
  for insert with check (
    bucket_id = 'posts-media'
    and auth.role() = 'authenticated'
  );

create policy "posts_media_delete" on storage.objects
  for delete using (
    bucket_id = 'posts-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
