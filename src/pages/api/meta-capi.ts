import type { APIRoute } from 'astro';

export const prerender = false; // Memastikan endpoint ini berjalan di server-side, tidak di-prerender saat build

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const body = await request.json();
    const { event_name, event_id, event_source_url, value, currency, content_ids, fbp, fbc } = body;

    const PIXEL_ID = '1992327198020900';
    // Ambil token dari environment variables (dapat diset di .env untuk lokal, dan di dashboard Cloudflare untuk production)
    const ACCESS_TOKEN = import.meta.env.META_CAPI_TOKEN;

    if (!ACCESS_TOKEN) {
      console.error('META_CAPI_TOKEN is missing');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
    }

    const unixTime = Math.floor(Date.now() / 1000);

    // Dapatkan IP address (sesuaikan dengan environment Cloudflare)
    // Cloudflare biasanya menempatkan IP client asli di header 'cf-connecting-ip'
    const ipAddress = request.headers.get('cf-connecting-ip') || clientAddress || request.headers.get('x-forwarded-for') || '';
    const userAgent = request.headers.get('user-agent') || '';

    const userData: any = {
      client_ip_address: ipAddress,
      client_user_agent: userAgent,
    };

    if (fbp) userData.fbp = fbp;
    if (fbc) userData.fbc = fbc;

    // Advanced matching hash (jika dikirim oleh frontend via POST body, opsional)
    if (body.em) userData.em = [body.em]; // Format harus dihash SHA256 sebelum dikirim ke CAPI
    if (body.ph) userData.ph = [body.ph]; // Format harus dihash SHA256 sebelum dikirim ke CAPI

    const customData: any = {};
    if (value !== undefined) customData.value = parseFloat(value); // Pastikan value berupa angka float/number
    if (currency) customData.currency = currency;
    if (content_ids && content_ids.length > 0) customData.content_ids = content_ids;
    
    // Tambahkan content_type wajib untuk e-commerce API (ViewContent, AddToCart, Purchase)
    if (['ViewContent', 'AddToCart', 'Purchase'].includes(event_name)) {
      customData.content_type = 'product';
    }

    const payload = {
      data: [
        {
          event_name: event_name,
          event_time: unixTime,
          action_source: 'website',
          event_id: event_id, // Wajib SAMA PERSIS dengan browser agar FB mendeduplikasi event ini
          event_source_url: event_source_url,
          user_data: userData,
          custom_data: Object.keys(customData).length > 0 ? customData : undefined,
          // Tambahkan test_event_code opsional untuk testing
          // test_event_code: 'TEST12345'
        }
      ]
    };

    const response = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const fbRes = await response.json();
    
    if (!response.ok) {
      console.error('Meta CAPI Error Response:', fbRes);
      return new Response(JSON.stringify({ error: 'Failed to send event to Meta CAPI', details: fbRes }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true, event_id: event_id, fb_response: fbRes }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('API Route Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
