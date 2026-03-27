import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUMAK_PRECIO = 9.99;

async function getPayPalToken(baseUrl: string, clientId: string, secret: string) {
  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${secret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token as string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { tipo, item_id, user_id } = await req.json();
    // tipo: 'suscripcion' | 'curso'

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let amount: number;
    let description: string;
    let customId: string;

    if (tipo === 'suscripcion') {
      amount = SUMAK_PRECIO;
      description = 'Suscripción mensual a Sumak';
      customId = `suscripcion:${user_id}`;
    } else {
      const { data: curso, error } = await supabase
        .from('cursos')
        .select('precio, titulo')
        .eq('id', item_id)
        .single();
      if (error || !curso) throw new Error('Curso no encontrado');
      amount = curso.precio;
      description = `Curso: ${curso.titulo}`;
      customId = `curso:${item_id}:${user_id}`;
    }

    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID')!;
    const paypalSecret = Deno.env.get('PAYPAL_SECRET')!;
    const paypalMode = Deno.env.get('PAYPAL_MODE') || 'sandbox';
    const paypalBaseUrl =
      paypalMode === 'live' ? 'https://api.paypal.com' : 'https://api.sandbox.paypal.com';
    const frontendUrl = Deno.env.get('FRONTEND_URL')!;

    const accessToken = await getPayPalToken(paypalBaseUrl, paypalClientId, paypalSecret);

    const order = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: { currency_code: 'USD', value: amount.toFixed(2) },
          description,
          custom_id: customId,
        },
      ],
      application_context: {
        return_url: tipo === 'suscripcion' ? `${frontendUrl}/suscripcion/exito` : `${frontendUrl}/pago/exito`,
        cancel_url: tipo === 'suscripcion' ? `${frontendUrl}/suscripcion/fallo` : `${frontendUrl}/pago/cancelado`,
      },
    };

    const orderRes = await fetch(`${paypalBaseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok) throw new Error(orderData.message || 'Error en PayPal');

    // Guardar registro pendiente en BD
    if (tipo === 'suscripcion') {
      // Suscripción a la plataforma — sin mentor_id
      await supabase.from('suscripciones_mentor').insert({
        alumno_id: user_id,
        estado: 'pendiente',
      });
    } else {
      await supabase.from('inscripciones').insert({
        alumno_id: user_id,
        curso_id: item_id,
        estado: 'pendiente',
      });
    }

    const approvalUrl = orderData.links?.find((l: any) => l.rel === 'approve')?.href;
    if (!approvalUrl) throw new Error('No se obtuvo URL de aprobación de PayPal');

    return new Response(
      JSON.stringify({ approval_url: approvalUrl, order_id: orderData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
