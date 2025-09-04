import express from "express";
import fetch from "node-fetch";
import crypto from "crypto";
import session from "express-session";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.set("trust proxy", 1);
app.use(session({
  name: "ttv.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: true,            // HTTPS on Cloudflare
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

const DISCORD_OAUTH_AUTHORIZE = "https://discord.com/api/oauth2/authorize";
const DISCORD_TOKEN = "https://discord.com/api/oauth2/token";
const DISCORD_ME = "https://discord.com/api/users/@me";

// 1) Kick off login
app.get("/login", (req, res) => {
  const state = crypto.randomBytes(24).toString("hex");
  req.session.oauth_state = state;

  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    response_type: "code",
    redirect_uri: process.env.REDIRECT_URI,
    scope: "identify email",            // add/remove scopes as needed
    state
  });

  res.redirect(`${DISCORD_OAUTH_AUTHORIZE}?${params.toString()}`);
});

// 2) OAuth callback
app.get("/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state || state !== req.session.oauth_state) {
    return res.status(400).send("Invalid state or code");
  }
  delete req.session.oauth_state;

  // Exchange code -> tokens
  const body = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code: code.toString(),
    redirect_uri: process.env.REDIRECT_URI
  });

  const tokenResp = await fetch(DISCORD_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  if (!tokenResp.ok) {
    const t = await tokenResp.text();
    return res.status(502).send(`Token exchange failed: ${t}`);
  }

  const tokenJson = await tokenResp.json(); // { access_token, token_type, expires_in, refresh_token, scope }
  const userResp = await fetch(DISCORD_ME, {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` }
  });

  if (!userResp.ok) {
    const t = await userResp.text();
    return res.status(502).send(`User fetch failed: ${t}`);
  }

  const user = await userResp.json(); // { id, username, email?, ... }

  // Persist the session
  req.session.user = {
    id: user.id,
    username: user.username,
    global_name: user.global_name,
    avatar: user.avatar,
    email: user.email
  };

  // Redirect to your site/app
  res.redirect("/"); // or to your dashboard
});

// 3) Example protected route
app.get("/me", (req, res) => {
  if (!req.session.user) return res.status(401).send("Not logged in");
  res.json(req.session.user);
});

// 4) Logout
app.post("/logout", (req, res) => {
  req.session.destroy(() => res.status(204).end());
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Auth server on :${port}`));
