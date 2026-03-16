
-- ============================================================
-- MentorHub MVP — Schema completo
-- ============================================================

-- 1. Enum de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'mentor', 'alumno', 'finanzas');

-- 2. Tabla de roles de usuario (separada de profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Función has_role (security definer para evitar recursión)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. Función update_updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 5. Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nombre TEXT NOT NULL DEFAULT '',
  apellido TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  bio TEXT,
  especialidad TEXT,
  redes_sociales JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Mentores
CREATE TABLE public.mentores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  descripcion TEXT,
  categorias TEXT[] DEFAULT '{}',
  precio_suscripcion NUMERIC(10,2) NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT false,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mentores ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_mentores_updated_at
  BEFORE UPDATE ON public.mentores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Cursos
CREATE TYPE public.curso_estado AS ENUM ('borrador', 'pendiente', 'publicado', 'rechazado');

CREATE TABLE public.cursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES public.mentores(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  imagen_url TEXT,
  precio NUMERIC(10,2) NOT NULL DEFAULT 0,
  es_incluido_en_suscripcion BOOLEAN NOT NULL DEFAULT true,
  estado curso_estado NOT NULL DEFAULT 'borrador',
  categoria TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_cursos_updated_at
  BEFORE UPDATE ON public.cursos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Módulos
CREATE TABLE public.modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  orden INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;

-- 9. Lecciones
CREATE TYPE public.leccion_tipo AS ENUM ('video', 'pdf', 'texto');

CREATE TABLE public.lecciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id UUID REFERENCES public.modulos(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  tipo leccion_tipo NOT NULL DEFAULT 'video',
  contenido_url TEXT,
  duracion_min INT,
  orden INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lecciones ENABLE ROW LEVEL SECURITY;

-- 10. Inscripciones (alumno ↔ curso)
CREATE TYPE public.inscripcion_estado AS ENUM ('activa', 'completada', 'cancelada');

CREATE TABLE public.inscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE NOT NULL,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  estado inscripcion_estado NOT NULL DEFAULT 'activa',
  UNIQUE(alumno_id, curso_id)
);
ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;

-- 11. Suscripciones a mentores
CREATE TYPE public.suscripcion_estado AS ENUM ('activa', 'cancelada', 'expirada');

CREATE TABLE public.suscripciones_mentor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mentor_id UUID REFERENCES public.mentores(id) ON DELETE CASCADE NOT NULL,
  estado suscripcion_estado NOT NULL DEFAULT 'activa',
  fecha_inicio TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_fin TIMESTAMPTZ,
  plan_id_mercadopago TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.suscripciones_mentor ENABLE ROW LEVEL SECURITY;

-- 12. Progreso de lecciones
CREATE TABLE public.progreso_lecciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  leccion_id UUID REFERENCES public.lecciones(id) ON DELETE CASCADE NOT NULL,
  completada BOOLEAN NOT NULL DEFAULT false,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(alumno_id, leccion_id)
);
ALTER TABLE public.progreso_lecciones ENABLE ROW LEVEL SECURITY;

-- 13. Notificaciones
CREATE TABLE public.notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'info',
  mensaje TEXT NOT NULL,
  leida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies
-- ============================================================

-- user_roles: users can see their own roles, admins can manage all
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- profiles: public read, own write
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- mentores: public read, own mentor or admin write
CREATE POLICY "Mentores are viewable by everyone" ON public.mentores
  FOR SELECT USING (true);
CREATE POLICY "Mentors can update own record" ON public.mentores
  FOR UPDATE USING (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "Admins can manage mentores" ON public.mentores
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- cursos: published are public, own mentor can manage, admin can manage
CREATE POLICY "Published cursos are viewable" ON public.cursos
  FOR SELECT USING (estado = 'publicado');
CREATE POLICY "Mentors can view own cursos" ON public.cursos
  FOR SELECT USING (
    mentor_id IN (SELECT m.id FROM public.mentores m JOIN public.profiles p ON m.profile_id = p.id WHERE p.user_id = auth.uid())
  );
CREATE POLICY "Mentors can insert own cursos" ON public.cursos
  FOR INSERT WITH CHECK (
    mentor_id IN (SELECT m.id FROM public.mentores m JOIN public.profiles p ON m.profile_id = p.id WHERE p.user_id = auth.uid())
  );
CREATE POLICY "Mentors can update own cursos" ON public.cursos
  FOR UPDATE USING (
    mentor_id IN (SELECT m.id FROM public.mentores m JOIN public.profiles p ON m.profile_id = p.id WHERE p.user_id = auth.uid())
  );
CREATE POLICY "Mentors can delete own cursos" ON public.cursos
  FOR DELETE USING (
    mentor_id IN (SELECT m.id FROM public.mentores m JOIN public.profiles p ON m.profile_id = p.id WHERE p.user_id = auth.uid())
  );
CREATE POLICY "Admins can manage cursos" ON public.cursos
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- modulos: same as cursos access
CREATE POLICY "Modulos viewable for published cursos" ON public.modulos
  FOR SELECT USING (
    curso_id IN (SELECT id FROM public.cursos WHERE estado = 'publicado')
    OR curso_id IN (SELECT c.id FROM public.cursos c JOIN public.mentores m ON c.mentor_id = m.id JOIN public.profiles p ON m.profile_id = p.id WHERE p.user_id = auth.uid())
  );
CREATE POLICY "Mentors can manage own modulos" ON public.modulos
  FOR ALL USING (
    curso_id IN (SELECT c.id FROM public.cursos c JOIN public.mentores m ON c.mentor_id = m.id JOIN public.profiles p ON m.profile_id = p.id WHERE p.user_id = auth.uid())
  );
CREATE POLICY "Admins can manage modulos" ON public.modulos
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- lecciones: same pattern
CREATE POLICY "Lecciones viewable for published cursos" ON public.lecciones
  FOR SELECT USING (
    modulo_id IN (SELECT mo.id FROM public.modulos mo JOIN public.cursos c ON mo.curso_id = c.id WHERE c.estado = 'publicado')
    OR modulo_id IN (SELECT mo.id FROM public.modulos mo JOIN public.cursos c ON mo.curso_id = c.id JOIN public.mentores m ON c.mentor_id = m.id JOIN public.profiles p ON m.profile_id = p.id WHERE p.user_id = auth.uid())
  );
CREATE POLICY "Mentors can manage own lecciones" ON public.lecciones
  FOR ALL USING (
    modulo_id IN (SELECT mo.id FROM public.modulos mo JOIN public.cursos c ON mo.curso_id = c.id JOIN public.mentores m ON c.mentor_id = m.id JOIN public.profiles p ON m.profile_id = p.id WHERE p.user_id = auth.uid())
  );
CREATE POLICY "Admins can manage lecciones" ON public.lecciones
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- inscripciones: own user
CREATE POLICY "Users can view own inscripciones" ON public.inscripciones
  FOR SELECT USING (auth.uid() = alumno_id);
CREATE POLICY "Users can insert own inscripciones" ON public.inscripciones
  FOR INSERT WITH CHECK (auth.uid() = alumno_id);
CREATE POLICY "Users can update own inscripciones" ON public.inscripciones
  FOR UPDATE USING (auth.uid() = alumno_id);
CREATE POLICY "Admins can manage inscripciones" ON public.inscripciones
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- suscripciones_mentor: own user
CREATE POLICY "Users can view own suscripciones" ON public.suscripciones_mentor
  FOR SELECT USING (auth.uid() = alumno_id);
CREATE POLICY "Users can insert own suscripciones" ON public.suscripciones_mentor
  FOR INSERT WITH CHECK (auth.uid() = alumno_id);
CREATE POLICY "Admins can manage suscripciones" ON public.suscripciones_mentor
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- progreso_lecciones: own user
CREATE POLICY "Users can view own progreso" ON public.progreso_lecciones
  FOR SELECT USING (auth.uid() = alumno_id);
CREATE POLICY "Users can insert own progreso" ON public.progreso_lecciones
  FOR INSERT WITH CHECK (auth.uid() = alumno_id);
CREATE POLICY "Users can update own progreso" ON public.progreso_lecciones
  FOR UPDATE USING (auth.uid() = alumno_id);

-- notificaciones: own user
CREATE POLICY "Users can view own notificaciones" ON public.notificaciones
  FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Users can update own notificaciones" ON public.notificaciones
  FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "Admins can manage notificaciones" ON public.notificaciones
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- Trigger: auto-create profile + alumno role on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nombre, apellido)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nombre', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'apellido', '')
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'alumno');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_mentores_profile_id ON public.mentores(profile_id);
CREATE INDEX idx_mentores_activo ON public.mentores(activo) WHERE activo = true;
CREATE INDEX idx_cursos_mentor_id ON public.cursos(mentor_id);
CREATE INDEX idx_cursos_estado ON public.cursos(estado);
CREATE INDEX idx_cursos_categoria ON public.cursos(categoria);
CREATE INDEX idx_modulos_curso_id ON public.modulos(curso_id);
CREATE INDEX idx_lecciones_modulo_id ON public.lecciones(modulo_id);
CREATE INDEX idx_inscripciones_alumno ON public.inscripciones(alumno_id);
CREATE INDEX idx_inscripciones_curso ON public.inscripciones(curso_id);
CREATE INDEX idx_suscripciones_alumno ON public.suscripciones_mentor(alumno_id);
CREATE INDEX idx_suscripciones_mentor ON public.suscripciones_mentor(mentor_id);
CREATE INDEX idx_progreso_alumno ON public.progreso_lecciones(alumno_id);
CREATE INDEX idx_notificaciones_usuario ON public.notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON public.notificaciones(usuario_id, leida) WHERE leida = false;

-- ============================================================
-- Storage bucket for avatars
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
