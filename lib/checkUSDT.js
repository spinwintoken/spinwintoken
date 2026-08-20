// lib/checkUSDT.js
import tronWeb from './tronweb.js';
import { sendSWT } from './sendSWT.js';
import { supabase } from './supabase.js';

const USDT_CONTRACT =
  process.env.USDT_CONTRACT || 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj'; // standard USDT
const RECEIVE_ADDRESS = process.env.USDT_RECEIVE_WALLET; // TPfDxtX...

// Decimal-safe USDT payment check
export async function checkUSDTPayment({ uid, userWallet, amountToken, priceindex }) {
  const price = parseFloat(priceindex);      // decimal (16,8)
  const tokenAmt = parseFloat(amountToken);  // decimal
  const costUSDT = tokenAmt * price;         // full precision

  // Get recent USDT Transfer events to your receive address
  const now = Date.now();
  const tenMinutesAgo = now - 10 * 60 * 1000;

  const events = await tronWeb.getEventByContract(USDT_CONTRACT, {
    eventName: 'Transfer',
    sinceTimestamp: tenMinutesAgo,
  });

  for (const ev of events) {
    const to = tronWeb.address.fromHex(ev.result.to);
    if (to !== RECEIVE_ADDRESS) continue;

    // USDT has 6 decimals
    const tronAmount = parseFloat(ev.result.value) / 1e6;

    const diff = Math.abs(tronAmount - costUSDT);

    // Allow tiny rounding differences
    if (diff < 0.000001) {
      // Payment confirmed → send SWT
      const txId = await sendSWT(userWallet, tokenAmt);

      // Log purchase in Supabase
      await supabase
        .from('UsersSQL')
        .update({
          teamtokenpurchased: tokenAmt,
          lastswttxid: txId,
        })
        .eq('uid', uid);

      return { ok: true, txId };
    }
  }

  return { ok: false };
}
