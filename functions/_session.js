// functions/_session.js
import { readSession } from "./_utils"; // createSession is used in callback

export async function getUserFromRequest(request, env) {
  // pass the secret string, not the whole env
  return readSession(request, env.SESSION_SECRET);
}
