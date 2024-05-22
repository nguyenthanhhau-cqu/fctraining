import { clerkMiddleware } from "@clerk/nextjs/server"

export default clerkMiddleware({
  apiUrl: "/api/webhook/clerk",
});

export const config = {
  matcher: ["/((?!.+.[w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};