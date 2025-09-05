import { COOKIE_STATE, setCookie, redirect } from "./_utils";

export async function onRequestGet({ env }) {
  const stateBytes = crypto.getRandomValues(new Uint8Array(24));
  const state = Array.from(stateBytes).map(b => b.toString(16).padStart(2, "0")).join("");

  const authorize = new URL("https://discord.com/api/oauth2/authorize");
  authorize.searchParams.set("client_id", env.DISCORD_CLIENT_ID);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("redirect_uri", `${env.BASE_URL}/callback`);
  authorize.searchParams.set("scope", "identify email guilds guilds.members.read");
  authorize.searchParams.set("state", state);

const isHttps = new URL(env.BASE_URL).protocol === "https:";
const cookie = setCookie(COOKIE_STATE, state, { maxAge: 300, secure: isHttps }); // 5 min

  return redirect(authorize.toString(), [cookie]);
}
