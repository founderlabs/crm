import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const leadDocumentRouter = createTRPCRouter({
  addDocument: publicProcedure
    .input(
      z.object({
        name: z.string(),
        type: z.string(),
        document: z.string(),
        leadId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.leadDocument.create({
        data: {
          name: input.name,
          type: input.type,
          document: input.document,
          lead: {
            connect: {
              id: input.leadId,
            },
          },
        },
      });

      return {
        message: "Document Added Successfully!",
      };
    }),
  deleteDocument: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.leadDocument.delete({
        where: {
          id: input.id,
        },
      });

      return {
        message: "Document Deleted Successfully!",
      };
    }),
  getAllDocument: publicProcedure
    .input(
      z.object({
        leadId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const documents = await ctx.db.leadDocument.findMany({
        where: {
          leadId: input.leadId,
        },
      });
      return documents;
    }),
  getSingleDocument: publicProcedure
    .input(
      z.object({
        documentId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.db.leadDocument.findUnique({
        where: {
          id: input.documentId,
        },
      });
      return document;
    }),
});
