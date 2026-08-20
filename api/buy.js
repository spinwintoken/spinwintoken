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

    // 1. Get newest TokenSQL row (decimal priceindex 16,8)
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

    // 2. Check USDT payment on-chain (decimal-safe)
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

    // 3. Return success (SWT already sent inside checkUSDTPayment)
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

