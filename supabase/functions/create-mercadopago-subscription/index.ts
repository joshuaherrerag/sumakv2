import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUMAK_PRECIO = 9.99;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const mpAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!;
    const frontendUrl = Deno.env.get('FRONTEND_URL')!;

    const preference = {
      reason: 'Suscripción mensual a Sumak',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: SUMAK_PRECIO,
        currency_id: 'USD',
      },
      back_urls: {
        success: `${frontendUrl}/suscripcion/exito`,
        failure: `${frontendUrl}/suscripcion/fallo`,
        pending: `${frontendUrl}/suscripcion/pendiente`,
      },
      external_reference: `suscripcion:${user_id}`,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/webhook-mercadopago`,
    };

    const mpResponse = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mpAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    const mpData = await mpResponse.json();
    if (!mpResponse.ok) throw new Error(mpData.message || 'Error en MercadoPago');

    // Guardar suscripción pendiente (sin mentor_id — suscripción a la plataforma)
    await supabase.from('suscripciones_mentor').insert({
      alumno_id: user_id,
      estado: 'pendiente',
      plan_id_mercadopago: mpData.id,
    });

    return new Response(
      JSON.stringify({ init_point: mpData.init_point }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
