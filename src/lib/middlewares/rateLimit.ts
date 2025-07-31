// lib/rateLimiter.ts
import { NextRequest, NextResponse } from "next/server";

const WINDOW = 60_000;
export const globalBuckets = new Map<string, { count: number; reset: number }>();
export const aiBuckets = new Map<string, { count: number; reset: number }>();

// Utility to get IP from request
function getIP(req: NextRequest) {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    "unknown"
  ).trim();
}

// Run cleanup every minute
setInterval(() => {
  const now = Date.now();
  for (const bucketMap of [globalBuckets, aiBuckets]) {
    for (const [ip, bucket] of bucketMap) {
      if (bucket.reset < now) {
        bucketMap.delete(ip);
      }
    }
  }
}, 60_000);

// Main rate limiter
export function rateLimiter(
  req: NextRequest,
  options: { bucketMap: Map<string, { count: number; reset: number }>, limit: number }
): NextResponse | void {
  const ip = getIP(req);
  const now = Date.now();
  const { bucketMap, limit } = options;

  const b = bucketMap.get(ip) ?? { count: 0, reset: now + WINDOW };
  if (now > b.reset) Object.assign(b, { count: 0, reset: now + WINDOW });

  if (++b.count > limit) {
    return NextResponse.json(
      { error: "Too many requests... Please wait a minute 🙏" },
      { status: 429 }
    );
  }

  bucketMap.set(ip, b);
}
