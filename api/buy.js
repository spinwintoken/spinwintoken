import { sendSWT } from '../lib/sendSWT.js';
import { supabase } from '../lib/supabase.js';
import { checkUSDTPayment } from '../lib/checkUSDT.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { uid, userWallet, amountSWT, amountUSDT } = req.body;

    if (!uid || !userWallet || !amountSWT || !amountUSDT) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // 1. Check USDT payment
    const payment = await checkUSDTPayment({ userWallet, amountUSDT });

    if (!payment.ok) {
      return res.status(400).json({ error: 'USDT payment not found or invalid' });
    }

    // 2. Send SWT to user
    const txId = await sendSWT(userWallet, amountSWT);

    // 3. Update Supabase
    await supabase
      .from('UsersSQL')
      .update({
        teamtokenpurchased: amountSWT,
        lastswttxid: txId,
      })
      .eq('uid', uid);

    return res.status(200).json({
      ok: true,
      txId,
      message: 'SWT sent successfully',
    });
  } catch (err) {
    console.error('BUY ERROR', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
