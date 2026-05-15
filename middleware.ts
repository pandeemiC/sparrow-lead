import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/onboarding(.*)",
]);
const isAuthRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
]);
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (isAuthRoute(req) && userId) {
    const onboarded = req.cookies.get("onboarded");
    return NextResponse.redirect(
      new URL(onboarded ? "/dashboard" : "/onboarding", req.url),
    );
  }

  if (isAuthRoute(req)) return;
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  if (isDashboardRoute(req) && userId) {
    const onboarded = req.cookies.get("onboarded");
    if (!onboarded) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
