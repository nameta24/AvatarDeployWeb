// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.error('Missing OPENAI_API_KEY environment variable. Set it on Render dashboard.');
  process.exit(1);
}

app.post('/openai/chat', async (req, res) => {
  try {
    const { text, model } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: text }
        ],
        max_tokens: 800
      })
    });

    if (!r.ok) {
      const detail = await r.text();
      return res.status(500).json({ error: 'OpenAI chat error', detail });
    }

    const json = await r.json();
    const content = json.choices && json.choices[0] && json.choices[0].message
      ? json.choices[0].message.content.trim()
      : '';

    return res.json({ text: content });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

app.post('/openai/tts', async (req, res) => {
  try {
    const { text, voice } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });

    const r = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        input: text,
        voice: voice || 'alloy'
      })
    });

    if (!r.ok) {
      const detail = await r.text();
      return res.status(500).json({ error: 'OpenAI TTS error', detail });
    }

    const buffer = await r.buffer();
    const base64 = buffer.toString('base64');
    return res.json({ audioBase64: base64, mime: 'audio/mpeg' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

app.get('/', (req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Server listening on', port));
