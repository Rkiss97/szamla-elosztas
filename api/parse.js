// Vercel Serverless Function — Claude API-t hívja a képfelismeréshez
// Az API kulcs a Vercel környezeti változóból (ANTHROPIC_API_KEY) jön, nem kerül a böngészőbe.

export default async function handler(req, res) {
  // CORS engedélyezés
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Csak POST kérés engedélyezett' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY környezeti változó nincs beállítva' });
  }

  try {
    const { image_base64, media_type } = req.body;
    if (!image_base64 || !media_type) {
      return res.status(400).json({ error: 'Hiányzó image_base64 vagy media_type' });
    }

    const prompt = `Ez egy magyar éttermi/kávézói nyugta. Olvasd ki az összes tételt és a felszolgálási díja(ka)t.

Válaszolj CSAK egy JSON objektummal, semmi más szöveg, semmi markdown backtick:
{
  "items": [
    {"name": "tétel neve rövidítve", "price": 1234}
  ],
  "service_fee": 0,
  "total": 0
}

FONTOS:
- Minden tételt külön sorként add meg (pl. ha 5x Aperol Spritz van, az 5 külön elem "Aperol Spritz #1" ... "Aperol Spritz #5" néven)
- A "service_fee" az ÖSSZES felszolgálási díj összege (ha több sor van, add össze)
- A "total" a nyugtán szereplő ÖSSZESEN érték forintban
- Az árakat számként add meg (integer), forintban, szóközök nélkül
- A tétel neveit tartsd rövidnek (max 40 karakter)`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type, data: image_base64 } },
            { type: 'text', text: prompt }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Claude API hiba: ${errText.substring(0, 300)}` });
    }

    const data = await response.json();
    const text = data.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
    const clean = text.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (e) {
      return res.status(500).json({ error: 'Nem sikerült JSON-ként értelmezni a választ', raw: clean });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: `Szerver hiba: ${err.message}` });
  }
}
