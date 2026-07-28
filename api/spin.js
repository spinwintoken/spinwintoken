const BingoSQL = require("../BingoSQL"); // your DB module

module.exports = async (req, res) => {
  console.log("SPIN API HIT:", req.body);

  try {
    const { bingo, spinpooltoken } = req.body;

    if (!bingo || bingo.length !== 6) {
      return res.status(400).json({ error: "Invalid bingo length" });
    }

    const crypto_wallet_id = bingo.repeat(3);

    await BingoSQL.insert({
      crypto_wallet_id
    });

    return res.json({
      ok: true,
      newSpinpooltoken: spinpooltoken,
      bingo18: crypto_wallet_id
    });

  } catch (err) {
    console.error("FULL SQL ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};


