export default async function handler(req, res) {
  try {
    const { bingo, spinpooltoken } = req.body;

    // Must be 6 characters
    if (!bingo || bingo.length !== 6) {
      return res.status(400).json({ error: "Invalid bingo length" });
    }

    // Create 18-character crypto_wallet_id
    const crypto_wallet_id = bingo.repeat(3);

    // Insert row into BingoSQL
    await BingoSQL.insert({
      crypto_wallet_id,        // REQUIRED (NOT NULL)
      bingo: crypto_wallet_id, // store same 18-char bingo
      created_at: new Date()
    });

    // Respond to frontend
    res.json({
      ok: true,
      newSpinpooltoken: spinpooltoken
    });

  } catch (err) {
    console.error("SQL ERROR:", err);
    res.status(500).json({ error: "DB insert failed" });
  }
}
