import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const body = await req.json();

    // MercadoPago envía: { type: 'payment', data: { id: 'xxx' } }
    if (body.type !== 'payment') {
      return new Response('ok', { status: 200 });
    }

    const paymentId = body.data?.id;
    if (!paymentId) return new Response('missing payment id', { status: 400 });

    const mpAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!;

    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mpAccessToken}` },
    });

    const payment = await paymentRes.json();

    if (payment.status !== 'approved') {
      return new Response('payment not approved', { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // external_reference formato: "userId_mentorId"
    const externalRef = payment.external_reference as string;
    const underscoreIdx = externalRef.indexOf('_');
    const userId = externalRef.substring(0, underscoreIdx);
    const mentorId = externalRef.substring(underscoreIdx + 1);

    await supabase
      .from('suscripciones_mentor')
      .update({ estado: 'activa', fecha_inicio: new Date().toISOString() })
      .eq('alumno_id', userId)
      .eq('mentor_id', mentorId)
      .eq('estado', 'pendiente');

    // Calcular liquidación
    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/calcular-liquidacion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
        Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!}`,
      },
      body: JSON.stringify({
        tipo: 'suscripcion',
        mentor_id: mentorId,
        monto: payment.transaction_amount,
      }),
    });

    return new Response('ok', { status: 200 });
  } catch (error) {
    console.error('Webhook MP error:', error);
    return new Response('error', { status: 500 });
  }
});
