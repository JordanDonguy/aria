// middleware.ts
import { NextResponse } from "next/server";
import { rateLimiter, globalBuckets } from "./lib/middlewares/rateLimit";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Ignore static or internal requests
  if (req.nextUrl.pathname.startsWith("/_next") || req.nextUrl.pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  const rateLimitResponse = rateLimiter(req, {
    bucketMap: globalBuckets,
    limit: 25,
  });
  if (rateLimitResponse) return rateLimitResponse;

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
