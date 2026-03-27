import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
  try {
    const event = await req.json();

    if (event.event_type !== 'CHECKOUT.ORDER.APPROVED') {
      return new Response('ok', { status: 200 });
    }

    const orderId = event.resource?.id;
    if (!orderId) return new Response('missing order id', { status: 400 });

    const paypalMode = Deno.env.get('PAYPAL_MODE') || 'sandbox';
    const paypalBaseUrl =
      paypalMode === 'live' ? 'https://api.paypal.com' : 'https://api.sandbox.paypal.com';
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID')!;
    const paypalSecret = Deno.env.get('PAYPAL_SECRET')!;

    const accessToken = await getPayPalToken(paypalBaseUrl, paypalClientId, paypalSecret);

    const orderRes = await fetch(`${paypalBaseUrl}/v2/checkout/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const order = await orderRes.json();

    if (order.status !== 'APPROVED') {
      return new Response('not approved', { status: 200 });
    }

    // Capturar el pago
    await fetch(`${paypalBaseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // custom_id formato: "tipo_itemId_userId"
    const customId = order.purchase_units?.[0]?.custom_id as string;
    if (!customId) throw new Error('custom_id faltante en la orden');
    const [tipo, itemId, userId] = customId.split('_');
    const monto = parseFloat(order.purchase_units[0].amount.value);

    if (tipo === 'suscripcion') {
      await supabase
        .from('suscripciones_mentor')
        .update({ estado: 'activa', fecha_inicio: new Date().toISOString() })
        .eq('alumno_id', userId)
        .eq('mentor_id', itemId)
        .eq('estado', 'pendiente');
    } else {
      await supabase
        .from('inscripciones')
        .update({ estado: 'activa' })
        .eq('alumno_id', userId)
        .eq('curso_id', itemId)
        .eq('estado', 'pendiente');
    }

    // Calcular liquidación
    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/calcular-liquidacion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
        Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!}`,
      },
      body: JSON.stringify({
        tipo,
        ...(tipo === 'suscripcion' ? { mentor_id: itemId } : { curso_id: itemId }),
        monto,
      }),
    });

    return new Response('ok', { status: 200 });
  } catch (error) {
    console.error('Webhook PayPal error:', error);
    return new Response('error', { status: 500 });
  }
});
