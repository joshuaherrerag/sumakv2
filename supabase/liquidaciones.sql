-- ============================================================
-- LIQUIDACIONES — Ejecutar en Supabase SQL Editor
-- ============================================================

-- Agregar estado 'pendiente' a los enums existentes
ALTER TYPE public.suscripcion_estado ADD VALUE IF NOT EXISTS 'pendiente';
ALTER TYPE public.inscripcion_estado  ADD VALUE IF NOT EXISTS 'pendiente';

-- Tabla de liquidaciones
CREATE TABLE IF NOT EXISTS public.liquidaciones (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id           UUID REFERENCES public.mentores(id) ON DELETE CASCADE NOT NULL,
  curso_id            UUID REFERENCES public.cursos(id) ON DELETE SET NULL,
  tipo                TEXT NOT NULL CHECK (tipo IN ('suscripcion', 'curso')),
  monto_total         NUMERIC(10,2) NOT NULL,
  comision_plataforma NUMERIC(10,2) NOT NULL,
  monto_mentor        NUMERIC(10,2) NOT NULL,
  estado              TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagada')),
  fecha_pago          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.liquidaciones ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_liquidaciones_mentor ON public.liquidaciones(mentor_id);
CREATE INDEX IF NOT EXISTS idx_liquidaciones_estado ON public.liquidaciones(estado);

DROP POLICY IF EXISTS "Mentores ven sus liquidaciones"  ON public.liquidaciones;
DROP POLICY IF EXISTS "Admins gestionan liquidaciones"  ON public.liquidaciones;

CREATE POLICY "Mentores ven sus liquidaciones" ON public.liquidaciones FOR SELECT USING (
  mentor_id IN (
    SELECT m.id FROM public.mentores m
    JOIN public.profiles p ON m.profile_id = p.id
    WHERE p.user_id = auth.uid()
  )
);
CREATE POLICY "Admins gestionan liquidaciones" ON public.liquidaciones FOR ALL USING (
  public.has_role(auth.uid(), 'admin')
);

GRANT SELECT ON public.liquidaciones TO authenticated;

NOTIFY pgrst, 'reload schema';
