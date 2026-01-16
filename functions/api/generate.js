// Cloudflare Pages Function for Google Gemini API Proxy
// This runs on Cloudflare Workers Edge Runtime

export async function onRequestPost(context) {
  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  };

  try {
    const { request } = context;
    
    // Parse Body
    let body;
    try {
        body = await request.json();
    } catch(e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }

    const { apiKey: bodyApiKey, model: bodyModel, messages, accessCode } = body;

    // 1. Security Check: Access Code
    const serverAccessCode = context.env.ACCESS_CODE;
    if (serverAccessCode && serverAccessCode !== accessCode) {
      return new Response(JSON.stringify({ error: 'Access Code Invalid' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Prioritize body params, fallback to server env vars
    // Change GOOGLE_API_KEY to DEEPSEEK_API_KEY
    const apiKey = bodyApiKey || context.env.DEEPSEEK_API_KEY;
    const model = bodyModel || context.env.AI_MODEL || 'deepseek-chat';

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing API Key. Please set DEEPSEEK_API_KEY in Cloudflare Pages.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const targetUrl = 'https://api.deepseek.com/chat/completions';

    const apiRes = await fetch(targetUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ 
        model, 
        messages,
        stream: false 
      }),
    });

    const data = await apiRes.json();

    return new Response(JSON.stringify(data), {
      status: apiRes.status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    },
  });
}
