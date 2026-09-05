import crypto from "crypto";

const SECRET = process.env.ADMIN_SECRET || "jhanarich-dev-secret-change-me";
const USER = process.env.ADMIN_USER || "admin";
const PASS = process.env.ADMIN_PASSWORD || "jhanarich2025";
export const COOKIE = "jh_admin";

export function checkCreds(user, password) {
  return user === USER && password === PASS;
}

export function makeToken() {
  const exp = Date.now() + 7 * 864e5;
  const payload = `${USER}.${exp}`;
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== "string") return false;
  const i = token.lastIndexOf(".");
  if (i < 0) return false;
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  const exp = Number(payload.split(".")[1]);
  if (!exp || Date.now() > exp) return false;
  const expect = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("base64url");
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect));
  } catch {
    return false;
  }
}
