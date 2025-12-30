import express from "express";
import cors from "cors";
import { AccessToken } from "livekit-server-sdk";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/token", (req, res) => {
  const { room, name } = req.body;
  if (!room || !name) {
    return res.status(400).json({ error: "room and name required" });
  }

  const identity = `${name}-${Math.random().toString(16).slice(2)}`;

  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    { identity, name }
  );

  token.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true
  });

  res.json({ token: token.toJwt() });
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Token server running on port ${port}`);
});
app.get("/health", (req, res) => res.json({ ok: true }));
