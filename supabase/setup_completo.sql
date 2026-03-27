-- ============================================================
-- SUMAK — SETUP COMPLETO
-- Seguro para ejecutar en cualquier estado del proyecto.
-- Usa IF NOT EXISTS y maneja duplicados en todos lados.
-- ============================================================

-- ============================================================
-- TIPOS ENUM (con manejo de duplicados)
-- ============================================================

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'mentor', 'alumno', 'finanzas');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.curso_estado AS ENUM ('borrador', 'pendiente', 'publicado', 'rechazado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.leccion_tipo AS ENUM ('video', 'pdf', 'texto');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.inscripcion_estado AS ENUM ('activa', 'completada', 'cancelada');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.suscripcion_estado AS ENUM ('activa', 'cancelada', 'expirada');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- FUNCIONES
-- ============================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================================
-- TABLAS BASE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role       public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nombre         TEXT NOT NULL DEFAULT '',
  apellido       TEXT NOT NULL DEFAULT '',
  avatar_url     TEXT,
  bio            TEXT,
  especialidad   TEXT,
  redes_sociales JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mentores (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  descripcion        TEXT,
  categorias         TEXT[] DEFAULT '{}',
  precio_suscripcion NUMERIC(10,2) NOT NULL DEFAULT 0,
  activo             BOOLEAN NOT NULL DEFAULT false,
  featured           BOOLEAN NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cursos (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id                  UUID REFERENCES public.mentores(id) ON DELETE CASCADE NOT NULL,
  titulo                     TEXT NOT NULL,
  descripcion                TEXT,
  imagen_url                 TEXT,
  precio                     NUMERIC(10,2) NOT NULL DEFAULT 0,
  es_incluido_en_suscripcion BOOLEAN NOT NULL DEFAULT true,
  estado                     public.curso_estado NOT NULL DEFAULT 'borrador',
  categoria                  TEXT NOT NULL DEFAULT '',
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.modulos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id   UUID REFERENCES public.cursos(id) ON DELETE CASCADE NOT NULL,
  titulo     TEXT NOT NULL,
  orden      INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lecciones (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id     UUID REFERENCES public.modulos(id) ON DELETE CASCADE NOT NULL,
  titulo        TEXT NOT NULL,
  tipo          public.leccion_tipo NOT NULL DEFAULT 'video',
  contenido_url TEXT,
  duracion_min  INT,
  orden         INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inscripciones (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  curso_id  UUID REFERENCES public.cursos(id) ON DELETE CASCADE NOT NULL,
  fecha     TIMESTAMPTZ NOT NULL DEFAULT now(),
  estado    public.inscripcion_estado NOT NULL DEFAULT 'activa',
  UNIQUE(alumno_id, curso_id)
);

CREATE TABLE IF NOT EXISTS public.suscripciones_mentor (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mentor_id           UUID REFERENCES public.mentores(id) ON DELETE CASCADE NOT NULL,
  estado              public.suscripcion_estado NOT NULL DEFAULT 'activa',
  fecha_inicio        TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_fin           TIMESTAMPTZ,
  plan_id_mercadopago TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.progreso_lecciones (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  leccion_id UUID REFERENCES public.lecciones(id) ON DELETE CASCADE NOT NULL,
  completada BOOLEAN NOT NULL DEFAULT false,
  fecha      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(alumno_id, leccion_id)
);

CREATE TABLE IF NOT EXISTS public.notificaciones (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipo       TEXT NOT NULL DEFAULT 'info',
  mensaje    TEXT NOT NULL,
  leida      BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.curso_mentores (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id           UUID REFERENCES public.cursos(id) ON DELETE CASCADE NOT NULL,
  mentor_id          UUID REFERENCES public.mentores(id) ON DELETE CASCADE NOT NULL,
  rol                TEXT NOT NULL DEFAULT 'colaborador',
  porcentaje_ingreso NUMERIC(5,2) DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(curso_id, mentor_id)
);

CREATE TABLE IF NOT EXISTS public.recursos_descargables (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leccion_id UUID REFERENCES public.lecciones(id) ON DELETE CASCADE NOT NULL,
  nombre     TEXT NOT NULL,
  url        TEXT NOT NULL,
  tipo       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.eventos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo           TEXT NOT NULL,
  descripcion      TEXT,
  tipo             TEXT NOT NULL DEFAULT 'online' CHECK (tipo IN ('online', 'presencial', 'hibrido')),
  modalidad_acceso TEXT NOT NULL DEFAULT 'incluido' CHECK (modalidad_acceso IN ('incluido', 'premium')),
  precio           NUMERIC(10,2) DEFAULT 0,
  fecha_inicio     TIMESTAMPTZ NOT NULL,
  fecha_fin        TIMESTAMPTZ NOT NULL,
  aforo            INT,
  url_streaming    TEXT,
  ubicacion        TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.evento_mentores (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id  UUID REFERENCES public.eventos(id) ON DELETE CASCADE NOT NULL,
  mentor_id  UUID REFERENCES public.mentores(id) ON DELETE CASCADE NOT NULL,
  rol        TEXT NOT NULL DEFAULT 'principal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(evento_id, mentor_id)
);

CREATE TABLE IF NOT EXISTS public.inscripciones_evento (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id  UUID REFERENCES public.eventos(id) ON DELETE CASCADE NOT NULL,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  estado     TEXT NOT NULL DEFAULT 'confirmada',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(evento_id, usuario_id)
);

CREATE TABLE IF NOT EXISTS public.posts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  contenido  TEXT NOT NULL,
  imagen_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.post_reacciones (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  usuario_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tipo       TEXT NOT NULL CHECK (tipo IN ('like', 'love', 'fire')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, usuario_id)
);

CREATE TABLE IF NOT EXISTS public.post_comentarios (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  autor_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  contenido  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.seguimientos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seguidor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seguido_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(seguidor_id, seguido_id),
  CHECK(seguidor_id <> seguido_id)
);

-- ============================================================
-- RLS — Habilitar en todas las tablas
-- ============================================================

ALTER TABLE public.user_roles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentores             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modulos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecciones            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscripciones        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suscripciones_mentor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progreso_lecciones   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curso_mentores       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recursos_descargables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evento_mentores      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscripciones_evento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reacciones      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comentarios     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seguimientos         ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TRIGGERS updated_at
-- ============================================================

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_mentores_updated_at ON public.mentores;
CREATE TRIGGER update_mentores_updated_at
  BEFORE UPDATE ON public.mentores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_cursos_updated_at ON public.cursos;
CREATE TRIGGER update_cursos_updated_at
  BEFORE UPDATE ON public.cursos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- RLS POLICIES — Drop existentes y recrear
-- ============================================================

-- user_roles
DROP POLICY IF EXISTS "Users can view own roles"   ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles"    ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles"  ON public.user_roles FOR ALL    USING (public.has_role(auth.uid(), 'admin'));

-- profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile"      ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"      ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile"      ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile"      ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- mentores
DROP POLICY IF EXISTS "Mentores are viewable by everyone" ON public.mentores;
DROP POLICY IF EXISTS "Mentors can update own record"     ON public.mentores;
DROP POLICY IF EXISTS "Admins can manage mentores"        ON public.mentores;
CREATE POLICY "Mentores are viewable by everyone" ON public.mentores FOR SELECT USING (true);
CREATE POLICY "Mentors can update own record"     ON public.mentores FOR UPDATE USING (
  profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage mentores" ON public.mentores FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- cursos
DROP POLICY IF EXISTS "Published cursos are viewable" ON public.cursos;
DROP POLICY IF EXISTS "Mentors can view own cursos"   ON public.cursos;
DROP POLICY IF EXISTS "Mentors can insert cursos"     ON public.cursos;
DROP POLICY IF EXISTS "Mentors can update cursos"     ON public.cursos;
DROP POLICY IF EXISTS "Mentors can delete cursos"     ON public.cursos;
DROP POLICY IF EXISTS "Admins can manage cursos"      ON public.cursos;
CREATE POLICY "Published cursos are viewable" ON public.cursos FOR SELECT USING (estado = 'publicado');
CREATE POLICY "Mentors can view own cursos"   ON public.cursos FOR SELECT USING (
  mentor_id IN (SELECT m.id FROM public.mentores m JOIN public.profiles p ON m.profile_id = p.id WHERE p.user_id = auth.uid())
);
CREATE POLICY "Mentors can insert cursos" ON public.cursos FOR INSERT WITH CHECK (
  mentor_id IN (SELECT m.id FROM public.mentores m JOIN public.profiles p ON m.profile_id = p.id WHERE p.user_id = auth.uid())
);
CREATE POLICY "Mentors can update cursos" ON public.cursos FOR UPDATE USING (
  mentor_id IN (SELECT m.id FROM public.mentores m JOIN public.profiles p ON m.profile_id = p.id WHERE p.user_id = auth.uid())
);
CREATE POLICY "Mentors can delete cursos" ON public.cursos FOR DELETE USING (
  mentor_id IN (SELECT m.id FROM public.mentores m JOIN public.profiles p ON m.profile_id = p.id WHERE p.user_id = auth.uid())
);
CREATE POLICY "Admins can manage cursos" ON public.cursos FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- modulos
DROP POLICY IF EXISTS "Modulos viewable for published cursos" ON public.modulos;
DROP POLICY IF EXISTS "Mentors can manage modulos"            ON public.modulos;
DROP POLICY IF EXISTS "Admins can manage modulos"             ON public.modulos;
CREATE POLICY "Modulos viewable for published cursos" ON public.modulos FOR SELECT USING (
  curso_id IN (SELECT id FROM public.cursos WHERE estado = 'publicado')
  OR curso_id IN (SELECT c.id FROM public.cursos c JOIN public.mentores m ON c.mentor_id = m.id JOIN public.profiles p ON m.profile_id = p.id WHERE p.user_id = auth.uid())
);
CREATE POLICY "Mentors can manage modulos" ON public.modulos FOR ALL USING (
  curso_id IN (SELECT c.id FROM public.cursos c JOIN public.mentores m ON c.mentor_id = m.id JOIN public.profiles p ON m.profile_id = p.id WHERE p.user_id = auth.uid())
);
CREATE POLICY "Admins can manage modulos" ON public.modulos FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- lecciones
DROP POLICY IF EXISTS "Lecciones viewable for published cursos" ON public.lecciones;
DROP POLICY IF EXISTS "Mentors can manage lecciones"            ON public.lecciones;
DROP POLICY IF EXISTS "Admins can manage lecciones"             ON public.lecciones;
CREATE POLICY "Lecciones viewable for published cursos" ON public.lecciones FOR SELECT USING (
  modulo_id IN (SELECT mo.id FROM public.modulos mo JOIN public.cursos c ON mo.curso_id = c.id WHERE c.estado = 'publicado')
  OR modulo_id IN (SELECT mo.id FROM public.modulos mo JOIN public.cursos c ON mo.curso_id = c.id JOIN public.mentores m ON c.mentor_id = m.id JOIN public.profiles p ON m.profile_id = p.id WHERE p.user_id = auth.uid())
);
CREATE POLICY "Mentors can manage lecciones" ON public.lecciones FOR ALL USING (
  modulo_id IN (SELECT mo.id FROM public.modulos mo JOIN public.cursos c ON mo.curso_id = c.id JOIN public.mentores m ON c.mentor_id = m.id JOIN public.profiles p ON m.profile_id = p.id WHERE p.user_id = auth.uid())
);
CREATE POLICY "Admins can manage lecciones" ON public.lecciones FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- inscripciones
DROP POLICY IF EXISTS "Users can view own inscripciones"   ON public.inscripciones;
DROP POLICY IF EXISTS "Users can insert own inscripciones" ON public.inscripciones;
DROP POLICY IF EXISTS "Users can update own inscripciones" ON public.inscripciones;
DROP POLICY IF EXISTS "Admins can manage inscripciones"    ON public.inscripciones;
CREATE POLICY "Users can view own inscripciones"   ON public.inscripciones FOR SELECT USING (auth.uid() = alumno_id);
CREATE POLICY "Users can insert own inscripciones" ON public.inscripciones FOR INSERT WITH CHECK (auth.uid() = alumno_id);
CREATE POLICY "Users can update own inscripciones" ON public.inscripciones FOR UPDATE USING (auth.uid() = alumno_id);
CREATE POLICY "Admins can manage inscripciones"    ON public.inscripciones FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- suscripciones_mentor
DROP POLICY IF EXISTS "Users can view own suscripciones"   ON public.suscripciones_mentor;
DROP POLICY IF EXISTS "Users can insert own suscripciones" ON public.suscripciones_mentor;
DROP POLICY IF EXISTS "Admins can manage suscripciones"    ON public.suscripciones_mentor;
CREATE POLICY "Users can view own suscripciones"   ON public.suscripciones_mentor FOR SELECT USING (auth.uid() = alumno_id);
CREATE POLICY "Users can insert own suscripciones" ON public.suscripciones_mentor FOR INSERT WITH CHECK (auth.uid() = alumno_id);
CREATE POLICY "Admins can manage suscripciones"    ON public.suscripciones_mentor FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- progreso_lecciones
DROP POLICY IF EXISTS "Users can view own progreso"   ON public.progreso_lecciones;
DROP POLICY IF EXISTS "Users can insert own progreso" ON public.progreso_lecciones;
DROP POLICY IF EXISTS "Users can update own progreso" ON public.progreso_lecciones;
CREATE POLICY "Users can view own progreso"   ON public.progreso_lecciones FOR SELECT USING (auth.uid() = alumno_id);
CREATE POLICY "Users can insert own progreso" ON public.progreso_lecciones FOR INSERT WITH CHECK (auth.uid() = alumno_id);
CREATE POLICY "Users can update own progreso" ON public.progreso_lecciones FOR UPDATE USING (auth.uid() = alumno_id);

-- notificaciones
DROP POLICY IF EXISTS "Users can view own notificaciones"   ON public.notificaciones;
DROP POLICY IF EXISTS "Users can update own notificaciones" ON public.notificaciones;
DROP POLICY IF EXISTS "Admins can manage notificaciones"    ON public.notificaciones;
CREATE POLICY "Users can view own notificaciones"   ON public.notificaciones FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Users can update own notificaciones" ON public.notificaciones FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "Admins can manage notificaciones"    ON public.notificaciones FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- curso_mentores
DROP POLICY IF EXISTS "curso_mentores_select" ON public.curso_mentores;
DROP POLICY IF EXISTS "curso_mentores_insert" ON public.curso_mentores;
DROP POLICY IF EXISTS "curso_mentores_delete" ON public.curso_mentores;
CREATE POLICY "curso_mentores_select" ON public.curso_mentores FOR SELECT USING (true);
CREATE POLICY "curso_mentores_insert" ON public.curso_mentores FOR INSERT WITH CHECK (
  curso_id IN (SELECT c.id FROM public.cursos c JOIN public.mentores m ON c.mentor_id = m.id JOIN public.profiles p ON m.profile_id = p.id WHERE p.user_id = auth.uid())
);
CREATE POLICY "curso_mentores_delete" ON public.curso_mentores FOR DELETE USING (
  curso_id IN (SELECT c.id FROM public.cursos c JOIN public.mentores m ON c.mentor_id = m.id JOIN public.profiles p ON m.profile_id = p.id WHERE p.user_id = auth.uid())
);

-- recursos_descargables
DROP POLICY IF EXISTS "recursos_select" ON public.recursos_descargables;
DROP POLICY IF EXISTS "recursos_insert" ON public.recursos_descargables;
DROP POLICY IF EXISTS "recursos_delete" ON public.recursos_descargables;
CREATE POLICY "recursos_select" ON public.recursos_descargables FOR SELECT USING (true);
CREATE POLICY "recursos_insert" ON public.recursos_descargables FOR INSERT WITH CHECK (
  leccion_id IN (SELECT l.id FROM public.lecciones l JOIN public.modulos mo ON l.modulo_id = mo.id JOIN public.cursos c ON mo.curso_id = c.id JOIN public.mentores m ON c.mentor_id = m.id JOIN public.profiles p ON m.profile_id = p.id WHERE p.user_id = auth.uid())
);
CREATE POLICY "recursos_delete" ON public.recursos_descargables FOR DELETE USING (
  leccion_id IN (SELECT l.id FROM public.lecciones l JOIN public.modulos mo ON l.modulo_id = mo.id JOIN public.cursos c ON mo.curso_id = c.id JOIN public.mentores m ON c.mentor_id = m.id JOIN public.profiles p ON m.profile_id = p.id WHERE p.user_id = auth.uid())
);

-- eventos
DROP POLICY IF EXISTS "eventos_select" ON public.eventos;
DROP POLICY IF EXISTS "eventos_insert" ON public.eventos;
DROP POLICY IF EXISTS "eventos_update" ON public.eventos;
DROP POLICY IF EXISTS "eventos_delete" ON public.eventos;
CREATE POLICY "eventos_select" ON public.eventos FOR SELECT USING (true);
CREATE POLICY "eventos_insert" ON public.eventos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "eventos_update" ON public.eventos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "eventos_delete" ON public.eventos FOR DELETE USING (auth.role() = 'authenticated');

-- evento_mentores
DROP POLICY IF EXISTS "evento_mentores_select" ON public.evento_mentores;
DROP POLICY IF EXISTS "evento_mentores_insert" ON public.evento_mentores;
DROP POLICY IF EXISTS "evento_mentores_delete" ON public.evento_mentores;
CREATE POLICY "evento_mentores_select" ON public.evento_mentores FOR SELECT USING (true);
CREATE POLICY "evento_mentores_insert" ON public.evento_mentores FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "evento_mentores_delete" ON public.evento_mentores FOR DELETE USING (auth.role() = 'authenticated');

-- inscripciones_evento
DROP POLICY IF EXISTS "inscripciones_evento_select" ON public.inscripciones_evento;
DROP POLICY IF EXISTS "inscripciones_evento_insert" ON public.inscripciones_evento;
CREATE POLICY "inscripciones_evento_select" ON public.inscripciones_evento FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "inscripciones_evento_insert" ON public.inscripciones_evento FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- posts
DROP POLICY IF EXISTS "posts_select" ON public.posts;
DROP POLICY IF EXISTS "posts_insert" ON public.posts;
DROP POLICY IF EXISTS "posts_delete" ON public.posts;
CREATE POLICY "posts_select" ON public.posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON public.posts FOR INSERT WITH CHECK (
  autor_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "posts_delete" ON public.posts FOR DELETE USING (
  autor_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- post_reacciones
DROP POLICY IF EXISTS "reacciones_select" ON public.post_reacciones;
DROP POLICY IF EXISTS "reacciones_insert" ON public.post_reacciones;
DROP POLICY IF EXISTS "reacciones_update" ON public.post_reacciones;
DROP POLICY IF EXISTS "reacciones_delete" ON public.post_reacciones;
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

-- post_comentarios
DROP POLICY IF EXISTS "comentarios_select" ON public.post_comentarios;
DROP POLICY IF EXISTS "comentarios_insert" ON public.post_comentarios;
DROP POLICY IF EXISTS "comentarios_delete" ON public.post_comentarios;
CREATE POLICY "comentarios_select" ON public.post_comentarios FOR SELECT USING (true);
CREATE POLICY "comentarios_insert" ON public.post_comentarios FOR INSERT WITH CHECK (
  autor_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "comentarios_delete" ON public.post_comentarios FOR DELETE USING (
  autor_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- seguimientos
DROP POLICY IF EXISTS "seguimientos_select" ON public.seguimientos;
DROP POLICY IF EXISTS "seguimientos_insert" ON public.seguimientos;
DROP POLICY IF EXISTS "seguimientos_delete" ON public.seguimientos;
CREATE POLICY "seguimientos_select" ON public.seguimientos FOR SELECT USING (true);
CREATE POLICY "seguimientos_insert" ON public.seguimientos FOR INSERT WITH CHECK (
  seguidor_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "seguimientos_delete" ON public.seguimientos FOR DELETE USING (
  seguidor_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- ============================================================
-- TRIGGER SIGNUP
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _rol_inicial TEXT;
  _profile_id  UUID;
BEGIN
  INSERT INTO public.profiles (user_id, nombre, apellido)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nombre', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'apellido', '')
  )
  RETURNING id INTO _profile_id;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'alumno');

  _rol_inicial := NEW.raw_user_meta_data ->> 'rol_inicial';
  IF _rol_inicial = 'mentor' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'mentor');
    INSERT INTO public.mentores (profile_id, activo) VALUES (_profile_id, false);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_id       ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id      ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_mentores_profile_id     ON public.mentores(profile_id);
CREATE INDEX IF NOT EXISTS idx_mentores_activo         ON public.mentores(activo) WHERE activo = true;
CREATE INDEX IF NOT EXISTS idx_cursos_mentor_id        ON public.cursos(mentor_id);
CREATE INDEX IF NOT EXISTS idx_cursos_estado           ON public.cursos(estado);
CREATE INDEX IF NOT EXISTS idx_inscripciones_alumno    ON public.inscripciones(alumno_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_curso     ON public.inscripciones(curso_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_alumno    ON public.suscripciones_mentor(alumno_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario  ON public.notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_posts_autor             ON public.posts(autor_id);
CREATE INDEX IF NOT EXISTS idx_posts_created           ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha           ON public.eventos(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_seguimientos_seguidor   ON public.seguimientos(seguidor_id);
CREATE INDEX IF NOT EXISTS idx_seguimientos_seguido    ON public.seguimientos(seguido_id);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars',       'avatars',       true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('course-covers', 'course-covers', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('resources',     'resources',     true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('posts-media',   'posts-media',   true) ON CONFLICT (id) DO NOTHING;

-- Limpiar policies de storage existentes para evitar duplicados
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'
    AND policyname IN (
      'Avatars are publicly accessible','Users can upload own avatar','Users can update own avatar','Users can delete own avatar',
      'course_covers_select','course_covers_insert','course_covers_delete',
      'resources_select','resources_insert','resources_delete',
      'posts_media_select','posts_media_insert','posts_media_delete'
    )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
  END LOOP;
END $$;

CREATE POLICY "Avatars are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar"     ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own avatar"     ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own avatar"     ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "course_covers_select" ON storage.objects FOR SELECT USING (bucket_id = 'course-covers');
CREATE POLICY "course_covers_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'course-covers' AND auth.role() = 'authenticated');
CREATE POLICY "course_covers_delete" ON storage.objects FOR DELETE USING (bucket_id = 'course-covers' AND auth.role() = 'authenticated');

CREATE POLICY "resources_select" ON storage.objects FOR SELECT USING (bucket_id = 'resources');
CREATE POLICY "resources_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resources' AND auth.role() = 'authenticated');
CREATE POLICY "resources_delete" ON storage.objects FOR DELETE USING (bucket_id = 'resources' AND auth.role() = 'authenticated');

CREATE POLICY "posts_media_select" ON storage.objects FOR SELECT USING (bucket_id = 'posts-media');
CREATE POLICY "posts_media_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'posts-media' AND auth.role() = 'authenticated');
CREATE POLICY "posts_media_delete" ON storage.objects FOR DELETE USING (bucket_id = 'posts-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- GRANTS
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT                          ON public.user_roles            TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE  ON public.profiles              TO authenticated;
GRANT SELECT, INSERT, UPDATE          ON public.mentores              TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE  ON public.cursos                TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE  ON public.modulos               TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE  ON public.lecciones             TO authenticated;
GRANT SELECT, INSERT, UPDATE          ON public.inscripciones         TO authenticated;
GRANT SELECT, INSERT                  ON public.suscripciones_mentor  TO authenticated;
GRANT SELECT, INSERT, UPDATE          ON public.progreso_lecciones    TO authenticated;
GRANT SELECT, UPDATE                  ON public.notificaciones        TO authenticated;
GRANT SELECT, INSERT, DELETE          ON public.curso_mentores        TO authenticated;
GRANT SELECT, INSERT, DELETE          ON public.recursos_descargables TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE  ON public.eventos               TO authenticated;
GRANT SELECT, INSERT, DELETE          ON public.evento_mentores       TO authenticated;
GRANT SELECT, INSERT                  ON public.inscripciones_evento  TO authenticated;
GRANT SELECT, INSERT, DELETE          ON public.posts                 TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE  ON public.post_reacciones       TO authenticated;
GRANT SELECT, INSERT, DELETE          ON public.post_comentarios      TO authenticated;
GRANT SELECT, INSERT, DELETE          ON public.seguimientos          TO authenticated;

GRANT SELECT ON public.profiles              TO anon;
GRANT SELECT ON public.mentores              TO anon;
GRANT SELECT ON public.cursos                TO anon;
GRANT SELECT ON public.modulos               TO anon;
GRANT SELECT ON public.lecciones             TO anon;
GRANT SELECT ON public.curso_mentores        TO anon;
GRANT SELECT ON public.recursos_descargables TO anon;
GRANT SELECT ON public.eventos               TO anon;
GRANT SELECT ON public.evento_mentores       TO anon;
GRANT SELECT ON public.posts                 TO anon;
GRANT SELECT ON public.post_reacciones       TO anon;
GRANT SELECT ON public.post_comentarios      TO anon;

-- ============================================================
NOTIFY pgrst, 'reload schema';
-- ============================================================
