export default async function handler(req, res) {
  try {
    const { bingo, spinpooltoken } = req.body;

    // Validate bingo
    if (!bingo || bingo.length !== 6) {
      return res.status(400).json({ error: "Invalid bingo length" });
    }

    // Create 18-character crypto_wallet_id
    const bingo18 = bingo.repeat(3);

    // Insert row into BingoSQL
    await BingoSQL.insert({
      crypto_wallet_id: bingo18,   // <-- use bingo18 as wallet ID
      bingo: bingo18,              // <-- also store bingo18
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
