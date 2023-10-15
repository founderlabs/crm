import { exampleRouter } from "~/server/api/routers/example";
import { createTRPCRouter } from "~/server/api/trpc";

import { leadRouter } from "./routers/lead";
import { crmListRouter } from "./routers/crmList";
import { leadDocumentRouter } from "./routers/document";
import { communicationRouter } from "./routers/communication";
import { leadFieldStructureRouter } from "./routers/leadStructure";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  leadFieldStructure: leadFieldStructureRouter,
  lead: leadRouter,
  // email: emailStructureRouter,
  // leadCommunication: communicationRouter,
  // leadDocument: leadDocumentRouter,
  crmList: crmListRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
