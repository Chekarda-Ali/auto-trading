import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicRoutes = [
  "/",
  "/sign-in",
  "/sign-up",
  "/api/webhooks/(.*)",
  "/blog/(.*)",
  "/docs/(.*)",
  "/exchanges",
  "/demo",
  "/pricing",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/sitemap.xml",
  "/robots.txt",
];

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Allow all public routes without sign-in
  for (const route of publicRoutes) {
    const regex = new RegExp("^" + route.replace("(.*)", ".*") + "$");
    if (regex.test(req.nextUrl.pathname)) {
      return NextResponse.next();
    }
  }

  // Redirect unauthenticated users to sign-in
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
