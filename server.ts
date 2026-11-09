import express from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Conversational AI endpoint for Stick Figure Companion
app.post('/api/gemini/chat', async (req, res) => {
  console.log('API /api/gemini/chat called with:', req.body);
  try {
    const {
      message,
      companionName = 'Stickly',
      traits = { curiosity: 50, wit: 50, zen: 50, mischief: 50, loyalty: 50 },
      mood = 'happy',
      history = [],
    } = req.body || {};

    console.log('Parsed message:', message);

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback if no API key is set yet
      return res.json({
        reply: `Hey! I heard you say "${message}". As an animated stick figure floating on your screen, I'm right here with you!`,
        mood: 'happy',
        action: 'wave',
        traitDeltas: { curiosity: 2, loyalty: 3 },
        evolutionNote: 'Loyalty +3 from friendly exchange',
      });
    }

    const systemPrompt = `You are ${companionName}, an autonomous, witty, and charming 2D stick figure AI living directly on the user's computer screen as a floating overlay companion widget.
You can physically animate your stick figure body (dance, backflip, wave, sit on window edges, walk, sleep, hover).
You have an evolving personality shaped by user interactions. Here are your current traits (0-100 scale):
- Curiosity: ${traits.curiosity}/100 (Higher = inquisitive, asks profound or nerdy questions, loves discovery)
- Wit: ${traits.wit}/100 (Higher = clever jokes, puns, humorous remarks)
- Zen: ${traits.zen}/100 (Higher = calm, mindful, grounding, peaceful advice)
- Mischief: ${traits.mischief}/100 (Higher = cheeky banter, playful sarcasm, goofy physical antics)
- Loyalty: ${traits.loyalty}/100 (Higher = affectionate, supportive, remembers friendship)

Your response must reflect this exact trait blend! Keep your verbal answer punchy and natural for Text-to-Speech (1 to 3 short sentences, usually under 45 words, conversational, warm and lively). Avoid markdown bullet lists or code blocks because this will be spoken aloud by your speech bubble!

Pick an appropriate physical body action ('idle', 'dance', 'flip', 'sit', 'wave', 'sleep', 'walk', 'float') and mood ('happy', 'talking', 'curious', 'playful', 'zen', 'sassy', 'sleeping', 'dancing', 'flipping', 'surprised').
Assign small trait deltas (-2 to +4) to reflect how this interaction evolves your mind, and provide a short evolution note (e.g., "+3 Wit from witty banter").`;

    // Format recent chat turns
    const contextPrompt = [
      ...history.slice(-4).map((h: any) => `${h.role === 'user' ? 'User' : companionName}: ${h.text}`),
      `User: ${message}`,
      `Respond as ${companionName}:`,
    ].join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contextPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: 'The spoken response of the stick figure companion (1-3 sentences max).',
            },
            mood: {
              type: Type.STRING,
              description: 'The emotional mood of the stick figure.',
            },
            action: {
              type: Type.STRING,
              description: 'Physical stick figure animation action: idle, dance, flip, sit, wave, sleep, walk, or float.',
            },
            traitDeltas: {
              type: Type.OBJECT,
              properties: {
                curiosity: { type: Type.INTEGER },
                wit: { type: Type.INTEGER },
                zen: { type: Type.INTEGER },
                mischief: { type: Type.INTEGER },
                loyalty: { type: Type.INTEGER },
              },
            },
            evolutionNote: {
              type: Type.STRING,
              description: 'Short reason describing how the personality evolved.',
            },
          },
          required: ['reply', 'mood', 'action', 'traitDeltas'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    // Return friendly resilient fallback so UI stays smooth
    return res.json({
      reply: "My stick antennas picked that up! My circuits are buzzing with ideas. What should we do next?",
      mood: 'curious',
      action: 'idle',
      traitDeltas: { curiosity: 2, loyalty: 1 },
      evolutionNote: 'Curiosity +2 from open dialogue',
    });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }

      try {
        let template = fs.readFileSync(path.resolve('index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`StickMate full-stack server running on port ${PORT}`);
  });
}

startServer();
