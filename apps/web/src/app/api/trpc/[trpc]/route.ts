import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/context";

// Allow up to 30s for serverless functions (Vercel default is 10s on Hobby)
export const maxDuration = 30;

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
    // Log ALL errors in every environment so Vercel Runtime Logs show them
    onError: ({ path, error }) => {
      console.error(`[tRPC] /${path ?? "unknown"}: ${error.message}`);
    },
  });

export { handler as GET, handler as POST };
