import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const crmListRouter = createTRPCRouter({
  addCrmList: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const createdCrmList = await ctx.db.crmList.create({
        data: {
          name: input.name,
          description: input.description,
        },
      });
      return createdCrmList;
    }),
  deleteCrmList: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.crmList.delete({
        where: {
          id: input.id,
        },
      });
      return {
        message: "CRM List Deleted Successfully!",
      };
    }),
  updateCRMList: publicProcedure
    .input(
      z.object({
        crmListId: z.string(),
        updateData: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { crmListId, updateData } = input;
      return await ctx.db.crmList.update({
        where: { id: crmListId },
        data: updateData,
      });
    }),
  getSingleCRMList: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const crmList = await ctx.db.crmList.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!crmList) {
        throw new Error("CRM list not found!");
      }

      return crmList;
    }),
  getAllCrmList: publicProcedure.query(async ({ ctx }) => {
    const crmList = await ctx.db.crmList.findMany();
    return crmList;
  }),
});
