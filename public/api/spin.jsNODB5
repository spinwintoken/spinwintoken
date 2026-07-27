export default async function handler(req, res) {
  try {
    const { bingo, spinpooltoken, crypto_wallet_id } = req.body;

    if (!bingo || bingo.length !== 6) {
      return res.status(400).json({ error: "Invalid bingo length" });
    }

    if (!crypto_wallet_id) {
      return res.status(400).json({ error: "Missing crypto_wallet_id" });
    }

    const bingo18 = bingo.repeat(3);

    await BingoSQL.insert({
      crypto_wallet_id: crypto_wallet_id,
      bingo: bingo18,
      created_at: new Date()
    });

    res.json({
      ok: true,
      newSpinpooltoken: spinpooltoken
    });

  } catch (err) {
    console.error("DB Insert Error:", err);
    res.status(500).json({ error: "DB insert failed" });
  }
}
