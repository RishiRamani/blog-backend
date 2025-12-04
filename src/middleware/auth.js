// src/middleware/auth.js
import "dotenv/config";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { LRUCache } from "lru-cache";

const SUPABASE_URL = process.env.SUPABASE_URL;

// Load JWKS from your Supabase project (ES256 keys)
const JWKS = createRemoteJWKSet(
  new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
);

// Cache tokens to reduce the number of key lookups
const tokenCache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header)
      return res.status(401).json({ error: "Missing Authorization header" });

    const token = header.split(" ")[1];
    if (!token)
      return res.status(401).json({ error: "Missing token" });

    // Cache check
    if (tokenCache.has(token)) {
      req.user = tokenCache.get(token);
      return next();
    }

    // Verify ES256 token with JWKS
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${SUPABASE_URL}/auth/v1`,
    });

    const user = {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    tokenCache.set(token, user);
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth verify error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
