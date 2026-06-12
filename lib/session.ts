import { SESSION_COOKIE_NAME } from "@/lib/constants";

const encoder = new TextEncoder();

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  }
  return encoder.encode(secret);
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

async function importKey() {
  return crypto.subtle.importKey(
    "raw",
    getSecret(),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(username: string) {
  const payload = toBase64Url(
    encoder.encode(
      JSON.stringify({
        username,
        role: "admin",
        exp: Date.now() + 12 * 60 * 60 * 1000,
      }),
    ),
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    await importKey(),
    encoder.encode(payload),
  );
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token?: string | null) {
  if (!token) return false;

  try {
    const [payload, signature, extra] = token.split(".");
    if (!payload || !signature || extra) return false;

    const validSignature = await crypto.subtle.verify(
      "HMAC",
      await importKey(),
      fromBase64Url(signature),
      encoder.encode(payload),
    );
    if (!validSignature) return false;

    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as {
      username?: unknown;
      role?: unknown;
      exp?: unknown;
    };
    return (
      data.role === "admin" &&
      typeof data.username === "string" &&
      typeof data.exp === "number" &&
      data.exp > Date.now()
    );
  } catch {
    return false;
  }
}

export function getSessionTokenFromRequest(request: Request) {
  const cookies = request.headers.get("cookie") ?? "";
  const match = cookies
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${SESSION_COOKIE_NAME}=`));

  return match ? decodeURIComponent(match.slice(SESSION_COOKIE_NAME.length + 1)) : null;
}

export async function isAdminRequest(request: Request) {
  return verifySessionToken(getSessionTokenFromRequest(request));
}
