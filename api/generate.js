// Vercel Serverless Function for Google Gemini API Proxy
// This file will be automatically deployed as an API endpoint by Vercel
import { URL } from 'url';

export default async function handler(request, response) {
  // 1. Handle CORS (Essential for public usage)
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { apiKey, model, contents } = request.body;

    if (!apiKey) {
      // In a real production app, you might want to use process.env.GOOGLE_API_KEY here
      // instead of accepting it from the client for better security.
      // But for this user-configurable demo, we accept it.
      return response.status(400).json({ error: 'Missing API Key' });
    }

    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const googleRes = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents }),
    });

    const data = await googleRes.json();

    if (!googleRes.ok) {
      console.error('Google API Error:', data);
      return response.status(googleRes.status).json(data);
    }

    response.status(200).json(data);

  } catch (error) {
    console.error('Proxy Error:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
}
