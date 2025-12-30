// server.js
import express from "express";
import cors from "cors";
import { AccessToken } from "livekit-server-sdk";

const app = express();

// Railway / cloud reverse proxies
app.set("trust proxy", true);

app.use(cors());
app.use(express.json());

// Simple health check
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.post("/token", (req, res) => {
  try {
    const { room, name } = req.body ?? {};

    // Validate server env
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return res.status(500).json({
        error: "api-key and api-secret must be set",
      });
    }

    // Validate request
    if (typeof room !== "string" || room.trim().length === 0) {
      return res.status(400).json({ error: "room is required" });
    }
    if (typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "name is required" });
    }

    const safeRoom = room.trim();
    const safeName = name.trim();

    // Unique identity per device/user
    const identity = `${safeName}-${Math.random().toString(16).slice(2)}`;

    // Create token
    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      name: safeName, // display name
    });

    at.addGrant({
      room: safeRoom,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    // IMPORTANT: token must be a STRING (JWT)
    const jwt = at.toJwt();

    return res.status(200).json({ token: jwt });
  } catch (e) {
    console.error("Token error:", e);
    return res.status(500).json({
      error: e?.message ? String(e.message) : String(e),
    });
  }
});

// Railway provides PORT
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`LiveKit token server listening on port ${port}`);
});
