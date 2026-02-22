import { router } from "../trpc";
import { clientRouter } from "./client";
import { organizationRouter } from "./organization";
import { noteRouter } from "./note";
import { tagRouter } from "./tag";
import { quoteRouter } from "./quote";
import { jobRouter } from "./job";
import { jobTaskRouter } from "./job-task";
import { changeOrderRouter } from "./change-order";
import { invoiceRouter } from "./invoice";
import { materialRouter } from "./material";

export const appRouter = router({
  clients: clientRouter,
  organization: organizationRouter,
  note: noteRouter,
  tag: tagRouter,
  quote: quoteRouter,
  job: jobRouter,
  jobTask: jobTaskRouter,
  changeOrder: changeOrderRouter,
  invoice: invoiceRouter,
  material: materialRouter,
});

export type AppRouter = typeof appRouter;
