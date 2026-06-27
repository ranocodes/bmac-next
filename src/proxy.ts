import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/admin(.*)"]);
const isPublicRoute = createRouteMatcher(["/admin/login", "/admin/accept-invite(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req) && !isPublicRoute(req)) {
    await auth.protect();
  }
}, { signInUrl: "/admin/login" });

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
