-- ============================================================
-- RESET COMPLETO — Ejecutar ANTES de setup_completo.sql
-- Elimina todas las tablas, tipos y funciones de Sumak
-- ============================================================

-- Tablas (en orden inverso de dependencias)
DROP TABLE IF EXISTS public.seguimientos         CASCADE;
DROP TABLE IF EXISTS public.post_comentarios     CASCADE;
DROP TABLE IF EXISTS public.post_reacciones      CASCADE;
DROP TABLE IF EXISTS public.posts                CASCADE;
DROP TABLE IF EXISTS public.inscripciones_evento CASCADE;
DROP TABLE IF EXISTS public.evento_mentores      CASCADE;
DROP TABLE IF EXISTS public.eventos              CASCADE;
DROP TABLE IF EXISTS public.recursos_descargables CASCADE;
DROP TABLE IF EXISTS public.curso_mentores       CASCADE;
DROP TABLE IF EXISTS public.notificaciones       CASCADE;
DROP TABLE IF EXISTS public.progreso_lecciones   CASCADE;
DROP TABLE IF EXISTS public.suscripciones_mentor CASCADE;
DROP TABLE IF EXISTS public.inscripciones        CASCADE;
DROP TABLE IF EXISTS public.lecciones            CASCADE;
DROP TABLE IF EXISTS public.modulos              CASCADE;
DROP TABLE IF EXISTS public.cursos               CASCADE;
DROP TABLE IF EXISTS public.mentores             CASCADE;
DROP TABLE IF EXISTS public.user_roles           CASCADE;
DROP TABLE IF EXISTS public.profiles             CASCADE;

-- Tipos enum
DROP TYPE IF EXISTS public.app_role          CASCADE;
DROP TYPE IF EXISTS public.curso_estado      CASCADE;
DROP TYPE IF EXISTS public.leccion_tipo      CASCADE;
DROP TYPE IF EXISTS public.inscripcion_estado CASCADE;
DROP TYPE IF EXISTS public.suscripcion_estado CASCADE;

-- Funciones
DROP FUNCTION IF EXISTS public.has_role(UUID, public.app_role)  CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column()       CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user()                CASCADE;

-- Trigger en auth.users (si existe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Storage policies (limpiar para evitar conflictos)
DELETE FROM storage.buckets WHERE id IN ('avatars','course-covers','resources','posts-media');

SELECT 'Reset completo. Ahora ejecutá setup_completo.sql' AS resultado;
