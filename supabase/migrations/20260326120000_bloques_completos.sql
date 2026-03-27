-- ============================================================
-- MIGRACIÓN COMPLETA: Bloques 1, 3 y 4
-- Ejecutar en Supabase SQL Editor del nuevo backend
-- ============================================================

-- ============================================================
-- BLOQUE CURSOS: curso_mentores + recursos_descargables
-- (Co-mentores y recursos descargables de lecciones)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.curso_mentores (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id           UUID REFERENCES public.cursos(id) ON DELETE CASCADE NOT NULL,
  mentor_id          UUID REFERENCES public.mentores(id) ON DELETE CASCADE NOT NULL,
  rol                TEXT NOT NULL DEFAULT 'colaborador',
  porcentaje_ingreso NUMERIC(5,2) DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(curso_id, mentor_id)
);
ALTER TABLE public.curso_mentores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "curso_mentores_select" ON public.curso_mentores
  FOR SELECT USING (true);
CREATE POLICY "curso_mentores_insert" ON public.curso_mentores
  FOR INSERT WITH CHECK (
    curso_id IN (
      SELECT c.id FROM public.cursos c
      JOIN public.mentores m ON c.mentor_id = m.id
      JOIN public.profiles p ON m.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );
CREATE POLICY "curso_mentores_delete" ON public.curso_mentores
  FOR DELETE USING (
    curso_id IN (
      SELECT c.id FROM public.cursos c
      JOIN public.mentores m ON c.mentor_id = m.id
      JOIN public.profiles p ON m.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- ----

CREATE TABLE IF NOT EXISTS public.recursos_descargables (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leccion_id  UUID REFERENCES public.lecciones(id) ON DELETE CASCADE NOT NULL,
  nombre      TEXT NOT NULL,
  url         TEXT NOT NULL,
  tipo        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.recursos_descargables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recursos_select" ON public.recursos_descargables
  FOR SELECT USING (true);
CREATE POLICY "recursos_insert" ON public.recursos_descargables
  FOR INSERT WITH CHECK (
    leccion_id IN (
      SELECT l.id FROM public.lecciones l
      JOIN public.modulos mo ON l.modulo_id = mo.id
      JOIN public.cursos c ON mo.curso_id = c.id
      JOIN public.mentores m ON c.mentor_id = m.id
      JOIN public.profiles p ON m.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );
CREATE POLICY "recursos_delete" ON public.recursos_descargables
  FOR DELETE USING (
    leccion_id IN (
      SELECT l.id FROM public.lecciones l
      JOIN public.modulos mo ON l.modulo_id = mo.id
      JOIN public.cursos c ON mo.curso_id = c.id
      JOIN public.mentores m ON c.mentor_id = m.id
      JOIN public.profiles p ON m.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- ============================================================
-- BLOQUE 1: Sistema de Eventos
-- ============================================================

CREATE TABLE IF NOT EXISTS public.eventos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo           TEXT NOT NULL,
  descripcion      TEXT,
  tipo             TEXT NOT NULL DEFAULT 'online'
                     CHECK (tipo IN ('online', 'presencial', 'hibrido')),
  modalidad_acceso TEXT NOT NULL DEFAULT 'incluido'
                     CHECK (modalidad_acceso IN ('incluido', 'premium')),
  precio           NUMERIC(10,2) DEFAULT 0,
  fecha_inicio     TIMESTAMPTZ NOT NULL,
  fecha_fin        TIMESTAMPTZ NOT NULL,
  aforo            INT,
  url_streaming    TEXT,
  ubicacion        TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "eventos_select" ON public.eventos
  FOR SELECT USING (true);
CREATE POLICY "eventos_insert" ON public.eventos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "eventos_update" ON public.eventos
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "eventos_delete" ON public.eventos
  FOR DELETE USING (auth.role() = 'authenticated');

-- ----

CREATE TABLE IF NOT EXISTS public.evento_mentores (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id  UUID REFERENCES public.eventos(id) ON DELETE CASCADE NOT NULL,
  mentor_id  UUID REFERENCES public.mentores(id) ON DELETE CASCADE NOT NULL,
  rol        TEXT NOT NULL DEFAULT 'principal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(evento_id, mentor_id)
);
ALTER TABLE public.evento_mentores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "evento_mentores_select" ON public.evento_mentores
  FOR SELECT USING (true);
CREATE POLICY "evento_mentores_insert" ON public.evento_mentores
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "evento_mentores_delete" ON public.evento_mentores
  FOR DELETE USING (auth.role() = 'authenticated');

-- ----

CREATE TABLE IF NOT EXISTS public.inscripciones_evento (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id  UUID REFERENCES public.eventos(id) ON DELETE CASCADE NOT NULL,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  estado     TEXT NOT NULL DEFAULT 'confirmada',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(evento_id, usuario_id)
);
ALTER TABLE public.inscripciones_evento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inscripciones_evento_select" ON public.inscripciones_evento
  FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "inscripciones_evento_insert" ON public.inscripciones_evento
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- ============================================================
-- BLOQUE 4: Sistema de Comunidad
-- ============================================================

CREATE TABLE IF NOT EXISTS public.posts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  contenido  TEXT NOT NULL,
  imagen_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_select" ON public.posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON public.posts FOR INSERT WITH CHECK (
  autor_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "posts_delete" ON public.posts FOR DELETE USING (
  autor_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- ----

CREATE TABLE IF NOT EXISTS public.post_reacciones (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  usuario_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tipo       TEXT NOT NULL CHECK (tipo IN ('like', 'love', 'fire')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, usuario_id)
);
ALTER TABLE public.post_reacciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reacciones_select" ON public.post_reacciones FOR SELECT USING (true);
CREATE POLICY "reacciones_insert" ON public.post_reacciones FOR INSERT WITH CHECK (
  usuario_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "reacciones_update" ON public.post_reacciones FOR UPDATE USING (
  usuario_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "reacciones_delete" ON public.post_reacciones FOR DELETE USING (
  usuario_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- ----

CREATE TABLE IF NOT EXISTS public.post_comentarios (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  autor_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  contenido  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.post_comentarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comentarios_select" ON public.post_comentarios FOR SELECT USING (true);
CREATE POLICY "comentarios_insert" ON public.post_comentarios FOR INSERT WITH CHECK (
  autor_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "comentarios_delete" ON public.post_comentarios FOR DELETE USING (
  autor_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- ----

CREATE TABLE IF NOT EXISTS public.seguimientos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seguidor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seguido_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(seguidor_id, seguido_id),
  CHECK(seguidor_id <> seguido_id)
);
ALTER TABLE public.seguimientos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seguimientos_select" ON public.seguimientos FOR SELECT USING (true);
CREATE POLICY "seguimientos_insert" ON public.seguimientos FOR INSERT WITH CHECK (
  seguidor_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "seguimientos_delete" ON public.seguimientos FOR DELETE USING (
  seguidor_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
  VALUES ('course-covers', 'course-covers', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('resources', 'resources', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('posts-media', 'posts-media', true)
  ON CONFLICT (id) DO NOTHING;

-- course-covers policies
CREATE POLICY "course_covers_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'course-covers');
CREATE POLICY "course_covers_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'course-covers' AND auth.role() = 'authenticated');
CREATE POLICY "course_covers_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'course-covers' AND auth.role() = 'authenticated');

-- resources policies
CREATE POLICY "resources_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'resources');
CREATE POLICY "resources_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'resources' AND auth.role() = 'authenticated');
CREATE POLICY "resources_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'resources' AND auth.role() = 'authenticated');

-- posts-media policies
CREATE POLICY "posts_media_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'posts-media');
CREATE POLICY "posts_media_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'posts-media' AND auth.role() = 'authenticated');
CREATE POLICY "posts_media_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'posts-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- GRANTS + NOTIFY
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.curso_mentores TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recursos_descargables TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eventos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evento_mentores TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inscripciones_evento TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_reacciones TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_comentarios TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seguimientos TO authenticated;

GRANT SELECT ON public.curso_mentores TO anon;
GRANT SELECT ON public.recursos_descargables TO anon;
GRANT SELECT ON public.eventos TO anon;
GRANT SELECT ON public.evento_mentores TO anon;
GRANT SELECT ON public.post_reacciones TO anon;
GRANT SELECT ON public.post_comentarios TO anon;
GRANT SELECT ON public.posts TO anon;

NOTIFY pgrst, 'reload schema';
