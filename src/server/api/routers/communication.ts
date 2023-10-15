import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCClientError } from "@trpc/client";

export const communicationRouter = createTRPCRouter({
  addEmail: publicProcedure
    .input(
      z.object({
        to: z.string(),
        from: z.string(),
        subjectLine: z.string(),
        previewLine: z.string(),
        message: z.string(),
        leadId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.communicationEmail.create({
        data: {
          to: input.to,
          from: input.from,
          subjectLine: input.subjectLine,
          previewLine: input.previewLine,
          message: input.message,
          lead: {
            connect: {
              id: input.leadId,
            },
          },
        },
      });

      return {
        message: "Email Sent Successfully!",
      };
    }),
  deleteEmail: publicProcedure
    .input(
      z.object({
        emailId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const deletedEmail = await ctx.db.communicationEmail.delete({
        where: { id: input.emailId },
      });

      if (!deletedEmail) {
        throw new TRPCClientError("Email not found!");
      }

      return {
        message: "Email deleted successfully!",
        email: deletedEmail,
      };
    }),
  getAllEmails: publicProcedure
    .input(
      z.object({
        leadId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const emails = await ctx.db.communicationEmail.findMany({
        where: {
          leadId: input.leadId,
        },
      });
      return emails;
    }),
  getSingleEmail: publicProcedure
    .input(
      z.object({
        emailId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const email = await ctx.db.communicationEmail.findUnique({
        where: {
          id: input.emailId,
        },
      });
      return email;
    }),
  getAllSMS: publicProcedure
    .input(
      z.object({
        leadId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const emails = await ctx.db.communicationSms.findMany({
        where: {
          leadId: input.leadId,
        },
      });
      return emails;
    }),
  getAllzoom: publicProcedure
    .input(
      z.object({
        leadId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const emails = await ctx.db.communicationCall.findMany({
        where: {
          leadId: input.leadId,
        },
      });
      return emails;
    }),

  addSms: publicProcedure
    .input(
      z.object({
        from: z.string(),
        message: z.string(),
        leadId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.communicationSms.create({
        data: {
          from: input.from,
          message: input.message,
          lead: {
            connect: {
              id: input.leadId,
            },
          },
        },
      });

      return {
        message: "SMS Sent Successfully!",
      };
    }),
  deleteSms: publicProcedure
    .input(
      z.object({
        smsId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const deletedSms = await ctx.db.communicationSms.delete({
        where: { id: input.smsId },
      });

      if (!deletedSms) {
        throw new TRPCClientError("SMS not found!");
      }

      return {
        message: "SMS deleted successfully!",
        sms: deletedSms,
      };
    }),
  getSingleSMS: publicProcedure
    .input(
      z.object({
        smsId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const sms = await ctx.db.communicationSms.findUnique({
        where: {
          id: input.smsId,
        },
      });
      return sms;
    }),

  addCall: publicProcedure
    .input(
      z.object({
        platform: z.string(),
        topic: z.string(),
        startTime: z.string(),
        duration: z.number(),
        timezone: z.string(),
        notes: z.string(),
        leadId: z.string(),
        startUrl: z.string(),
        linkUrl: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.communicationCall.create({
        data: {
          platform: input.platform,
          topic: input.topic,
          startTime: input.startTime,
          duration: input.duration,
          timezone: input.timezone,
          linkUrl: input.linkUrl,
          startUrl: input.startUrl,
          notes: input.notes,
          lead: {
            connect: {
              id: input.leadId,
            },
          },
        },
      });

      return {
        message: "Call Sent Successfully!",
      };
    }),
  getSingleCall: publicProcedure
    .input(
      z.object({
        callId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const call = await ctx.db.communicationCall.findUnique({
        where: {
          id: input.callId,
        },
      });
      return call;
    }),
  deleteCall: publicProcedure
    .input(
      z.object({
        callId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const deletedCall = await ctx.db.communicationCall.delete({
        where: { id: input.callId },
      });

      if (!deletedCall) {
        throw new TRPCClientError("Schedule not found!");
      }

      return {
        message: "Schedule deleted successfully!",
        call: deletedCall,
      };
    }),
});
