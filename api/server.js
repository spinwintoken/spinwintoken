// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import buyHandler from './api/buy.js';
import spinHandler from './api/spin.js';
import { supabase } from './lib/supabase.js';

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));

// Spin API
app.post('/api/spin', spinHandler);

// Buy API
app.post('/api/buy', buyHandler);

// TokenSQL API (for token.html)
app.get('/api/tokenSQL', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('TokenSQL')
      .select('priceindex, token1, token2, token3')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return res.status(500).json({ error: 'TokenSQL not available' });
    }

    res.json({
      priceindex: data.priceindex.toString(), // keep decimal as string
      token1: data.token1,
      token2: data.token2,
      token3: data.token3,
    });
  } catch (err) {
    console.error('TOKENSQL API ERROR', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
