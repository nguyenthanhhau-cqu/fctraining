import { clerkMiddleware } from "@clerk/nextjs/server"

export default clerkMiddleware({
  apiUrl: "/api/webhook",
});

export const config = {
  matcher: ["/((?!.+.[w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};