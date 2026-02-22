import "server-only";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/context";

export async function api() {
  const context = await createContext();
  return appRouter.createCaller(context);
}
