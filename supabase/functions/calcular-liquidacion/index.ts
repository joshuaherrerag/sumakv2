import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const COMISION_PLATAFORMA = 0.15; // 15%

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { tipo, curso_id, mentor_id, monto } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const comision = monto * COMISION_PLATAFORMA;
    const montoNeto = monto - comision;

    if (tipo === 'curso') {
      // Verificar co-mentores con porcentaje asignado
      const { data: coMentores } = await supabase
        .from('curso_mentores')
        .select('mentor_id, porcentaje_ingreso')
        .eq('curso_id', curso_id);

      if (coMentores && coMentores.length > 0) {
        const inserts = coMentores.map((cm) => ({
          mentor_id: cm.mentor_id,
          curso_id,
          tipo: 'curso',
          monto_total: monto,
          comision_plataforma: comision,
          monto_mentor: montoNeto * (cm.porcentaje_ingreso / 100),
          estado: 'pendiente',
        }));
        await supabase.from('liquidaciones').insert(inserts);
      } else {
        // Todo al mentor principal del curso
        const { data: curso } = await supabase
          .from('cursos')
          .select('mentor_id')
          .eq('id', curso_id)
          .single();

        if (curso) {
          await supabase.from('liquidaciones').insert({
            mentor_id: curso.mentor_id,
            curso_id,
            tipo: 'curso',
            monto_total: monto,
            comision_plataforma: comision,
            monto_mentor: montoNeto,
            estado: 'pendiente',
          });
        }
      }
    } else {
      // Suscripción — directo al mentor
      await supabase.from('liquidaciones').insert({
        mentor_id,
        curso_id: null,
        tipo: 'suscripcion',
        monto_total: monto,
        comision_plataforma: comision,
        monto_mentor: montoNeto,
        estado: 'pendiente',
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
