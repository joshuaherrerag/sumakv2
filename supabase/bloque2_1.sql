-- Bloque 2.1: Modelo de negocio — suscripción a la plataforma Sumak
-- mentor_id pasa a ser nullable (suscripción sin mentor específico = suscripción a Sumak)

ALTER TABLE public.suscripciones_mentor
  ALTER COLUMN mentor_id DROP NOT NULL;

-- Índice para buscar suscripciones de plataforma (mentor_id IS NULL)
CREATE INDEX IF NOT EXISTS idx_suscripciones_plataforma
  ON public.suscripciones_mentor (alumno_id)
  WHERE mentor_id IS NULL;
