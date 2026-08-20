// api/buy.js
import { supabase } from '../lib/supabase.js';
import { checkUSDTPayment } from '../lib/checkUSDT.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { uid, userWallet, amountSWT } = req.body;

    if (!uid || !userWallet || !amountSWT) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const { data: tokenRow, error: tokenErr } = await supabase
      .from('TokenSQL')
      .select('priceindex')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tokenErr || !tokenRow) {
      return res.status(500).json({ error: 'Priceindex not available' });
    }

    const priceindex = tokenRow.priceindex;

    const payment = await checkUSDTPayment({
      uid,
      userWallet,
      amountToken: amountSWT,
      priceindex,
    });

    if (!payment.ok) {
      return res
        .status(400)
        .json({ error: 'USDT payment not found or invalid' });
    }

    return res.status(200).json({
      ok: true,
      txId: payment.txId,
      message: 'SWT sent successfully',
    });
  } catch (err) {
    console.error('BUY ERROR', err);
    return res.status(500).json({ error: 'Server error' });
  }
}


