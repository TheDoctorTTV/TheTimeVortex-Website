import { readSession } from "./_utils"; // you already createSession() in callback.js

export async function getUserFromRequest(request, env) {
  return readSession(request, env); // returns user object or null
}
