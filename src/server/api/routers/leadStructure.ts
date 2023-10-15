import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCClientError } from "@trpc/client";
export const leadFieldStructureRouter = createTRPCRouter({
  addLeadFieldStructure: publicProcedure
    .input(
      z.object({
        firstName: z.boolean(),
        firstNameRequired: z.boolean(),
        lastName: z.boolean(),
        lastNameRequired: z.boolean(),
        company: z.boolean(),
        companyRequired: z.boolean(),
        displayName: z.boolean(),
        displayNameRequired: z.boolean(),
        email: z.boolean(),
        emailRequired: z.boolean(),
        website: z.boolean(),
        websiteRequired: z.boolean(),
        mainPhone: z.boolean(),
        mainPhoneRequired: z.boolean(),
        mobilePhone: z.boolean(),
        mobilePhoneRequired: z.boolean(),
        workPhone: z.boolean(),
        workPhoneRequired: z.boolean(),
        faxNumber: z.boolean(),
        faxNumberRequired: z.boolean(),
        addressLine1: z.boolean(),
        addressLine1Required: z.boolean(),
        addressLine2: z.boolean(),
        addressLine2Required: z.boolean(),
        postalCode: z.boolean(),
        postalCodeRequired: z.boolean(),
        city: z.boolean(),
        cityRequired: z.boolean(),
        state: z.boolean(),
        stateRequired: z.boolean(),
        startDate: z.boolean(),
        startDateRequired: z.boolean(),
        endDate: z.boolean(),
        endDateRequired: z.boolean(),
        crmListId: z.string(),
        customFields: z
          .object({
            fieldName: z.string(),
            fieldType: z.enum(["DATE", "DECIMAL", "NUMBER", "TEXT", "BOOLEAN"]),
            fieldVisibility: z.boolean().optional(),
            required: z.boolean().optional(),
          })
          .array(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.leadFieldStructure.create({
        data: {
          firstName: input.firstName,
          firstNameRequired: input.firstNameRequired,
          lastName: input.lastName,
          lastNameRequired: input.lastNameRequired,
          company: input.company,
          companyRequired: input.companyRequired,
          displayName: true,
          displayNameRequired: true,
          email: input.email,
          emailRequired: input.emailRequired,
          website: input.website,
          websiteRequired: input.websiteRequired,
          mainPhone: input.mainPhone,
          mainPhoneRequired: input.mainPhoneRequired,
          mobilePhone: input.mobilePhone,
          mobilePhoneRequired: input.mobilePhoneRequired,
          workPhone: input.workPhone,
          workPhoneRequired: input.workPhoneRequired,
          faxNumber: input.faxNumber,
          faxNumberRequired: input.faxNumberRequired,
          addressLine1: input.addressLine1,
          addressLine1Required: input.addressLine1Required,
          addressLine2: input.addressLine2,
          addressLine2Required: input.addressLine2Required,
          postalCode: input.postalCode,
          postalCodeRequired: input.postalCodeRequired,
          city: input.city,
          cityRequired: input.cityRequired,
          state: input.state,
          stateRequired: input.stateRequired,
          startDate: input.startDate,
          startDateRequired: input.startDateRequired,
          endDate: input.endDate,
          endDateRequired: input.endDateRequired,
          crmListId: input.crmListId,
          crmList: {
            connect: {
              id: input.crmListId,
            },
          },
        },
      });
      input.customFields.map(async (customField) => {
        return await ctx.db.customField.create({
          data: {
            fieldName: customField.fieldName,
            fieldType: customField.fieldType,
            required: customField.required,
            fieldVisibility: customField.fieldVisibility,
            leadFieldStructure: {
              connect: {
                crmListId: input.crmListId,
              },
            },
          },
        });
      });
      return {
        message: "Lead Structure added Successfully!!",
      };
    }),
  updateLeadStructure: publicProcedure
    .input(
      z.object({
        crmListId: z.string(),
        firstName: z.boolean(),
        firstNameRequired: z.boolean(),
        lastName: z.boolean(),
        lastNameRequired: z.boolean(),
        company: z.boolean(),
        companyRequired: z.boolean(),
        displayName: z.boolean(),
        displayNameRequired: z.boolean(),
        email: z.boolean(),
        emailRequired: z.boolean(),
        website: z.boolean(),
        websiteRequired: z.boolean(),
        mainPhone: z.boolean(),
        mainPhoneRequired: z.boolean(),
        mobilePhone: z.boolean(),
        mobilePhoneRequired: z.boolean(),
        workPhone: z.boolean(),
        workPhoneRequired: z.boolean(),
        faxNumber: z.boolean(),
        faxNumberRequired: z.boolean(),
        addressLine1: z.boolean(),
        addressLine1Required: z.boolean(),
        addressLine2: z.boolean(),
        addressLine2Required: z.boolean(),
        postalCode: z.boolean(),
        postalCodeRequired: z.boolean(),
        city: z.boolean(),
        cityRequired: z.boolean(),
        state: z.boolean(),
        stateRequired: z.boolean(),
        startDate: z.boolean(),
        startDateRequired: z.boolean(),
        endDate: z.boolean(),
        endDateRequired: z.boolean(),
        customFields: z
          .object({
            fieldName: z.string(),
            fieldType: z.enum(["DATE", "DECIMAL", "NUMBER", "TEXT", "BOOLEAN"]),
            required: z.boolean().optional(),
            fieldVisibility: z.boolean().optional(),
          })
          .array(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingLeadStructure = await ctx.db.leadFieldStructure.findUnique({
        where: { crmListId: input.crmListId },
        include: { customFields: true },
      });
      if (!existingLeadStructure) {
        throw new TRPCClientError("Lead structure not found!");
      }
      await ctx.db.leadFieldStructure.update({
        where: { crmListId: input.crmListId },
        data: {
          firstName:
            input.firstName !== undefined
              ? input.firstName
              : existingLeadStructure.firstName,
          lastName:
            input.lastName !== undefined
              ? input.lastName
              : existingLeadStructure.lastName,
          company:
            input.company !== undefined
              ? input.company
              : existingLeadStructure.company,
          displayName: true,
          email:
            input.email !== undefined
              ? input.email
              : existingLeadStructure.email,
          website:
            input.website !== undefined
              ? input.website
              : existingLeadStructure.website,
          mainPhone:
            input.mainPhone !== undefined
              ? input.mainPhone
              : existingLeadStructure.mainPhone,
          mobilePhone:
            input.mobilePhone !== undefined
              ? input.mobilePhone
              : existingLeadStructure.mobilePhone,
          workPhone:
            input.workPhone !== undefined
              ? input.workPhone
              : existingLeadStructure.workPhone,
          faxNumber:
            input.faxNumber !== undefined
              ? input.faxNumber
              : existingLeadStructure.faxNumber,
          addressLine1:
            input.addressLine1 !== undefined
              ? input.addressLine1
              : existingLeadStructure.addressLine1,
          addressLine2:
            input.addressLine2 !== undefined
              ? input.addressLine2
              : existingLeadStructure.addressLine2,
          postalCode:
            input.postalCode !== undefined
              ? input.postalCode
              : existingLeadStructure.postalCode,
          city:
            input.city !== undefined ? input.city : existingLeadStructure.city,
          state:
            input.state !== undefined
              ? input.state
              : existingLeadStructure.state,
          startDate:
            input.startDate !== undefined
              ? input.startDate
              : existingLeadStructure.startDate,
          endDate:
            input.endDate !== undefined
              ? input.endDate
              : existingLeadStructure.endDate,

          firstNameRequired:
            input.firstNameRequired !== undefined
              ? input.firstNameRequired
              : existingLeadStructure.firstNameRequired,
          lastNameRequired:
            input.lastNameRequired !== undefined
              ? input.lastNameRequired
              : existingLeadStructure.lastNameRequired,
          companyRequired:
            input.companyRequired !== undefined
              ? input.companyRequired
              : existingLeadStructure.companyRequired,
          displayNameRequired: true,
          emailRequired:
            input.emailRequired !== undefined
              ? input.emailRequired
              : existingLeadStructure.emailRequired,
          websiteRequired:
            input.websiteRequired !== undefined
              ? input.websiteRequired
              : existingLeadStructure.websiteRequired,
          mainPhoneRequired:
            input.mainPhoneRequired !== undefined
              ? input.mainPhoneRequired
              : existingLeadStructure.mainPhoneRequired,
          mobilePhoneRequired:
            input.mobilePhoneRequired !== undefined
              ? input.mobilePhoneRequired
              : existingLeadStructure.mobilePhoneRequired,
          workPhoneRequired:
            input.workPhoneRequired !== undefined
              ? input.workPhoneRequired
              : existingLeadStructure.workPhoneRequired,
          faxNumberRequired:
            input.faxNumberRequired !== undefined
              ? input.faxNumberRequired
              : existingLeadStructure.faxNumberRequired,
          addressLine1Required:
            input.addressLine1Required !== undefined
              ? input.addressLine1Required
              : existingLeadStructure.addressLine1Required,
          addressLine2Required:
            input.addressLine2Required !== undefined
              ? input.addressLine2Required
              : existingLeadStructure.addressLine2Required,
          postalCodeRequired:
            input.postalCodeRequired !== undefined
              ? input.postalCodeRequired
              : existingLeadStructure.postalCodeRequired,
          cityRequired:
            input.cityRequired !== undefined
              ? input.cityRequired
              : existingLeadStructure.cityRequired,
          stateRequired:
            input.stateRequired !== undefined
              ? input.stateRequired
              : existingLeadStructure.stateRequired,
          startDateRequired:
            input.startDateRequired !== undefined
              ? input.startDateRequired
              : existingLeadStructure.startDateRequired,
          endDateRequired:
            input.endDateRequired !== undefined
              ? input.endDateRequired
              : existingLeadStructure.endDateRequired,
        },
      });
      const existingCustomFields = existingLeadStructure.customFields;
      await Promise.all(
        input.customFields.map(async (customField) => {
          const existingCustomField = existingCustomFields.find(
            (field) => field.fieldName === customField.fieldName,
          );
          if (existingCustomField) {
            await ctx.db.customField.update({
              where: { id: existingCustomField.id },
              data: {
                fieldType:
                  customField.fieldType !== undefined
                    ? customField.fieldType
                    : existingCustomField.fieldType,
                required:
                  customField.required !== undefined
                    ? customField.required
                    : existingCustomField.required,
                fieldVisibility:
                  customField.fieldVisibility !== undefined
                    ? customField.fieldVisibility
                    : existingCustomField.fieldVisibility,
                fieldName:
                  customField.fieldName !== undefined
                    ? customField.fieldName
                    : existingCustomField.fieldName,
              },
            });
          } else {
            await ctx.db.customField.create({
              data: {
                fieldName: customField.fieldName,
                fieldType: customField.fieldType,
                required: customField.required,
                fieldVisibility: customField.fieldVisibility,
                leadFieldStructure: {
                  connect: {
                    crmListId: input.crmListId,
                  },
                },
              },
            });
          }
        }),
      );
      return {
        message: "Lead Structure updated successfully!",
      };
    }),
  getLeadStructure: publicProcedure
    .input(
      z.object({
        crmListId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const leadFieldStructure = await ctx.db.leadFieldStructure.findUnique({
        where: {
          crmListId: input.crmListId,
        },
        include: {
          customFields: true,
        },
      });
      return leadFieldStructure;
    }),
  deleteCustomField: publicProcedure
    .input(
      z.object({
        customFieldId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const deletedCustomField = await ctx.db.customField.delete({
        where: {
          id: input.customFieldId,
        },
      });
      if (!deletedCustomField) {
        throw new TRPCClientError("Lead Structure not found!");
      }
      return {
        message: "Lead Structure deleted successfully!",
        customField: deletedCustomField,
      };
    }),
  updateCustomFields: publicProcedure
    .input(
      z.object({
        customFieldId: z.string(),
        customFieldData: z.object({
          // fieldName: z.string().optional(),
          fieldType: z
            .enum(["DATE", "DECIMAL", "NUMBER", "TEXT", "BOOLEAN"])
            .optional(),
          fieldVisibility: z.boolean().optional(),
          required: z.boolean().optional(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.customField.update({
        where: {
          id: input.customFieldId,
        },
        data: {
          ...input.customFieldData,
        },
      });
    }),
});
