import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function lastChars(str, n) {
  if (!str) return "";
  return str.slice(-n);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { bingo, spinpooltoken } = req.body;

    console.log("Received bingo:", bingo);

    if (!Array.isArray(bingo) || bingo.length !== 6) {
      res.status(400).json({ error: "Invalid bingo code" });
      return;
    }

    // use bingo characters EXACTLY as sent (no lowercasing)
    const [A, f, seven, Q, two, Z] = bingo;
    const bingoString = bingo.join("");

    const base = Number(spinpooltoken) || 1250;

    const percent_18 = base * 0.18;
    const percent_15 = base * 0.15;
    const percent_12 = base * 0.12;
    const percent_9  = base * 0.09;
    const percent_6  = base * 0.06;
    const percent_3  = base * 0.03;
    const percent_7  = base * 0.07;

    // read ALL BingoSQL rows
    const { data: bingoRows, error: bingoErr } = await supabase
      .from("BingoSQL")
      .select("*");

    if (bingoErr) {
      res.status(500).json({ error: bingoErr.message });
      return;
    }

    let count3 = 0;
    let count6 = 0;
    let count9 = 0;
    let count12 = 0;
    let count15 = 0;
    let count18 = 0;
    let count7 = 0;

    // count matches
    for (const row of bingoRows) {
      const walletId = row.crypto_wallet_id || "";

      const last1 = lastChars(walletId, 1);
      const last2 = lastChars(walletId, 2);
      const last3 = lastChars(walletId, 3);
      const last4 = lastChars(walletId, 4);
      const last5 = lastChars(walletId, 5);
      const last6 = lastChars(walletId, 6);

      if (last1 === Z) count3++;
      if (last2[0] === two) count6++;
      if (last3[0] === Q) count9++;
      if (last4[0] === seven) count12++;
      if (last5[0] === f) count15++;
      if (last6[0] === A) count18++;
      if (last6 === bingoString) count7++;
    }

    // calculate pct_x
    const pct_3  = count3  ? percent_3  / count3  : 0;
    const pct_6  = count6  ? percent_6  / count6  : 0;
    const pct_9  = count9  ? percent_9  / count9  : 0;
    const pct_12 = count12 ? percent_12 / count12 : 0;
    const pct_15 = count15 ? percent_15 / count15 : 0;
    const pct_18 = count18 ? percent_18 / count18 : 0;
    const pct_7  = count7  ? percent_7  / count7  : 0;

    // update BingoSQL rows
    for (const row of bingoRows) {
      const id = row.id;
      const walletId = row.crypto_wallet_id || "";

      const last1 = lastChars(walletId, 1);
      const last2 = lastChars(walletId, 2);
      const last3 = lastChars(walletId, 3);
      const last4 = lastChars(walletId, 4);
      const last5 = lastChars(walletId, 5);
      const last6 = lastChars(walletId, 6);

      let update = {};

      if (last1 === Z && pct_3)  update.pct_3  = (row.pct_3  || 0) + pct_3;
      if (last2[0] === two && pct_6)  update.pct_6  = (row.pct_6  || 0) + pct_6;
      if (last3[0] === Q && pct_9)   update.pct_9  = (row.pct_9  || 0) + pct_9;
      if (last4[0] === seven && pct_12) update.pct_12 = (row.pct_12 || 0) + pct_12;
      if (last5[0] === f && pct_15) update.pct_15 = (row.pct_15 || 0) + pct_15;
      if (last6[0] === A && pct_18) update.pct_18 = (row.pct_18 || 0) + pct_18;
      if (last6 === bingoString && pct_7) update.pct_7 = (row.pct_7 || 0) + pct_7;

      if (Object.keys(update).length > 0) {
        await supabase.from("BingoSQL").update(update).eq("id", id);
      }
    }

    // update TokenSQL
    const totalSubtract =
      percent_3 + percent_6 + percent_9 +
      percent_12 + percent_15 + percent_18 + percent_7;

    const { data: tokenRows, error: tokenErr } = await supabase
      .from("TokenSQL")
      .select("*")
      .limit(1);

    if (tokenErr) {
      res.status(500).json({ error: tokenErr.message });
      return;
    }

    const tokenRow = tokenRows[0];
    const currentPool = Number(tokenRow.spinpooltoken) || 0;

    const newSpinpooltoken = currentPool - totalSubtract;

    await supabase
      .from("TokenSQL")
      .update({
        spinpooltoken: newSpinpooltoken,
        updated_at: new Date().toISOString()
      })
      .eq("id", tokenRow.id);

    res.status(200).json({
      ok: true,
      bingo: bingoString,
      newSpinpooltoken
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

