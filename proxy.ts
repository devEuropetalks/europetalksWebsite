import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextRequest, NextFetchEvent } from "next/server";

export default function proxy(
  request: NextRequest,
  event: NextFetchEvent
) {
  return clerkMiddleware({
    authorizedParties: [
      "http://localhost:3000",
      "https://cloud.europetalks.eu",
      "https://europetalks.eu",
    ],
  })(request, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
