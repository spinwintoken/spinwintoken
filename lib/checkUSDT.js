// lib/checkUSDT.js
import tronWeb from './tronweb.js';
import { sendSWT } from './sendSWT.js';
import { supabase } from './supabase.js';

const USDT_CONTRACT =
  process.env.USDT_CONTRACT || 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj';
const RECEIVE_ADDRESS = process.env.USDT_RECEIVE_WALLET;

export async function checkUSDTPayment({ uid, userWallet, amountToken, priceindex }) {
  const price = parseFloat(priceindex);      // decimal (16,8)
  const tokenAmt = parseFloat(amountToken);  // decimal
  const costUSDT = tokenAmt * price;         // full precision

  const since = Date.now() - 10 * 60 * 1000;

  const events = await tronWeb.getEventByContract(USDT_CONTRACT, {
    eventName: 'Transfer',
    sinceTimestamp: since,
  });

  for (const ev of events) {
    const to = tronWeb.address.fromHex(ev.result.to);
    if (to !== RECEIVE_ADDRESS) continue;

    const tronAmount = parseFloat(ev.result.value) / 1e6; // USDT 6 decimals
    const diff = Math.abs(tronAmount - costUSDT);

    if (diff < 0.000001) {
      const txId = await sendSWT(userWallet, tokenAmt);

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
