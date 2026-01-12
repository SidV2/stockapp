/**
 * Simple Express proxy server for OpenAI API
 * This bypasses CORS restrictions by proxying requests through the backend
 * 
 * To use:
 * 1. Install: npm install express cors dotenv
 * 2. Create .env file with: OPENAI_API_KEY=your-key-here
 * 3. Run: node scripts/ai-proxy-server.js
 * 4. Update AI service to use http://localhost:3001/api/analyze
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Enable CORS for your Angular app
app.use(cors({
  origin: 'http://localhost:4200'
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Proxy Server running' });
});

// OpenAI proxy endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { prompt, model = 'gpt-3.5-turbo' } = req.body;
    
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured in .env file' 
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert financial analyst specializing in technical and fundamental stock analysis. Provide clear, actionable trading signals based on the data provided. Always respond in valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API Error:', error);
      return res.status(response.status).json({ 
        error: 'OpenAI API request failed',
        details: error 
      });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const analysis = JSON.parse(content);

    res.json(analysis);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 AI Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying requests to OpenAI API`);
  console.log(`🔑 API Key: ${process.env.OPENAI_API_KEY ? '✓ Configured' : '✗ Missing'}`);
  console.log(`\nEndpoints:`);
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log(`  POST http://localhost:${PORT}/api/analyze`);
});
