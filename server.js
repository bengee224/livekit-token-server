app.post("/token", (req, res) => {
  try {
    const { room, name } = req.body || {};

    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
      return res.status(500).json({ error: "Missing LIVEKIT_API_KEY or LIVEKIT_API_SECRET" });
    }
    if (!room || !name) {
      return res.status(400).json({ error: "room and name required" });
    }

    const identity = `${name}-${Math.random().toString(16).slice(2)}`;

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { identity, name }
    );

    at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });

    return res.json({ token: at.toJwt() }); // <-- MUST be a string
  } catch (e) {
    console.error("Token error:", e);
    return res.status(500).json({ error: String(e?.message || e) });
  }
});
