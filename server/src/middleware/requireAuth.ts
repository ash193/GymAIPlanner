import type { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import "dotenv/config";

const authUrl = process.env.NEON_AUTH_URL;

if (!authUrl) {
  throw new Error("NEON_AUTH_URL is required");
}

const issuer = new URL(authUrl).origin;

const jwks = createRemoteJWKSet(
  new URL(`${authUrl.replace(/\/+$/, "")}/.well-known/jwks.json`),
);

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      error: "Authentication required",
    });
    return;
  }

  const token = authorization.slice(7);

  if (!token) {
    res.status(401).json({
      error: "Authentication required",
    });
    return;
  }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
    });

    if (!payload.sub) {
      res.status(401).json({
        error: "Invalid authentication token",
      });
      return;
    }
    res.locals.userId = payload.sub;
  } catch {
    console.error("Authentication verification failed");
    res.status(401).json({
      error: "Invalid or expired authentication token",
    });
    return;
  }
  next();
}
