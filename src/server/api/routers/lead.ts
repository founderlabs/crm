import { TRPCClientError } from "@trpc/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

interface CustomField {
  fieldName: string;
  fieldType: "DATE" | "DECIMAL" | "NUMBER" | "TEXT" | "BOOLEAN" | "OPTIONLIST";
  required: boolean;
}
export const leadRouter = createTRPCRouter({
  addLead: publicProcedure
    .input(
      z.object({
        crmListId: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        company: z.string().optional(),
        displayName: z.string(),
        email: z.string().optional(),
        website: z.string().optional(),
        mainPhone: z.string().optional(),
        mobilePhone: z.string().optional(),
        workPhone: z.string().optional(),
        faxNumber: z.string().optional(),
        addressLine1: z.string().optional(),
        addressLine2: z.string().optional(),
        postalCode: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        customFields: z
          .array(
            z.object({
              fieldName: z.string(),
              fieldValue: z
                .string()
                .or(
                  z
                    .date()
                    .or(z.number().or(z.string().array().or(z.boolean()))),
                ),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const leadFieldStructure = await ctx.db.leadFieldStructure.findUnique({
        where: { crmListId: input.crmListId },
        include: { customFields: true },
      });
      // const tierInformation = await ctx.db.tierInformation.findUnique({
      //   where: {
      //     organizationId: ctx.session.user?.organizationId,
      //   },
      // });

      const requiredFields = Object.entries(leadFieldStructure ?? [])
        .filter(([fieldName, fieldConfig]) => {
          return (
            fieldName !== "crmListId" &&
            fieldConfig === true &&
            //@ts-expect-error
            leadFieldStructure[`${fieldName}Required`] === true
          );
        })
        .map(([fieldName]) => fieldName);
      for (const field of requiredFields) {
        //@ts-expect-error
        if (!input[field]) {
          throw new TRPCClientError(`Required field missing: ${field}`);
        }
      }
      if (leadFieldStructure?.customFields.length !== 0) {
        const customFieldsMap = leadFieldStructure?.customFields.reduce(
          (map, field) => {
            map[field.fieldName] = field;
            return map;
          },
          {} as Record<string, CustomField>,
        );
        if (!customFieldsMap) {
          throw new TRPCClientError(
            "Custom fields not found from lead structure.",
          );
        }
        const requiredCustomFields = leadFieldStructure?.customFields.filter(
          (field) => field.required,
        );
        const inputRequiredCustomFields = input?.customFields?.filter((cf) => {
          const field = customFieldsMap[cf.fieldName];
          return field && field.required;
        });
        const inputNonRequiredCustomFields = input?.customFields?.filter(
          (cf) => {
            const field = customFieldsMap[cf.fieldName];
            return field && !field.required;
          },
        );

        const missingRequiredFields: string[] = [];

        for (const field of requiredCustomFields ?? []) {
          if (
            !inputRequiredCustomFields?.some(
              (cf) => cf.fieldName === field.fieldName,
            )
          ) {
            missingRequiredFields.push(field.fieldName);
          }
        }

        if (missingRequiredFields.length > 0) {
          const missingFieldsNames = missingRequiredFields.join(", ");
          throw new TRPCClientError(
            `Missing required custom fields: ${missingFieldsNames}`,
          );
        }

        const customFieldsData: any[] = [];
        if (inputRequiredCustomFields) {
          for (const customField of inputRequiredCustomFields) {
            const fieldName = customField.fieldName;
            const fieldValue = customField.fieldValue;

            if (!customFieldsMap[fieldName]) {
              throw new TRPCClientError(`Invalid custom field: ${fieldName}`);
            }
            const fieldType = customFieldsMap[fieldName].fieldType;

            if (!isFieldValueValid(fieldType, fieldValue)) {
              throw new TRPCClientError(
                `Invalid value for custom field: ${fieldName}`,
              );
            }

            customFieldsData.push({ fieldName, fieldValue });
          }
        }
        if (inputNonRequiredCustomFields) {
          for (const nonRequiredField of inputNonRequiredCustomFields) {
            const fieldName = nonRequiredField.fieldName;
            const fieldValue = nonRequiredField.fieldValue;

            if (!customFieldsMap[fieldName]) {
              throw new TRPCClientError(`Invalid custom field: ${fieldName}`);
            }
            const fieldType = customFieldsMap[fieldName].fieldType;

            if (!isFieldValueValid(fieldType, fieldValue)) {
              throw new TRPCClientError(
                `Invalid value for custom field: ${fieldName}`,
              );
            }

            customFieldsData.push({ fieldName, fieldValue });
          }
        }
        const createdLead = await ctx.db.lead.create({
          data: {
            firstName: input.firstName,
            lastName: input.lastName,
            company: input.company,
            displayName: input.displayName,
            email: input.email,
            website: input.website,
            mainPhone: input.mainPhone,
            mobilePhone: input.mobilePhone,
            workPhone: input.workPhone,
            faxNumber: input.faxNumber,
            addressLine1: input.addressLine1,
            addressLine2: input.addressLine2,
            postalCode: input.postalCode,
            city: input.city,
            state: input.state,
            startDate: input.startDate,
            endDate: input.endDate,
            customFieldsData,
            crmList: {
              connect: {
                id: input.crmListId,
              },
            },
          },
        });

        return {
          success: true,
          message: "Lead created successfully for custom fields.",
          data: createdLead,
        };
      }

      const createdLead = await ctx.db.lead.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          company: input.company,
          displayName: input.displayName,
          email: input.email,
          website: input.website,
          mainPhone: input.mainPhone,
          mobilePhone: input.mobilePhone,
          workPhone: input.workPhone,
          faxNumber: input.faxNumber,
          addressLine1: input.addressLine1,
          addressLine2: input.addressLine2,
          postalCode: input.postalCode,
          city: input.city,
          state: input.state,
          startDate: input.startDate,
          endDate: input.endDate,
          crmList: {
            connect: {
              id: input.crmListId,
            },
          },
        },
      });

      return {
        success: true,
        message: "Lead created successfully for custom fields.",
        data: createdLead,
      };
    }),
  updateLead: publicProcedure
    .input(
      z.object({
        crmListId: z.string(),
        leadId: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        company: z.string().optional(),
        displayName: z.string(),
        email: z.string().optional(),
        website: z.string().optional(),
        mainPhone: z.string().optional(),
        mobilePhone: z.string().optional(),
        workPhone: z.string().optional(),
        faxNumber: z.string().optional(),
        addressLine1: z.string().optional(),
        addressLine2: z.string().optional(),
        postalCode: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        notes: z.string().optional(),
        status: z
          .enum([
            "EASY_START",
            "NEW_LEAD",
            "QUALIFIED_LEAD",
            "OPENED",
            "IN_PROGRESS",
            "EMAILED",
            "CALLED",
            "SMS",
            "UNQUALIFIED",
            "ATTEMPTED_TO_CONTACT",
            "CONNECTED",
            "BAD_TIMING",
          ])
          .optional(),
        customFields: z
          .array(
            z.object({
              fieldName: z.string(),
              fieldValue: z
                .string()
                .or(
                  z
                    .date()
                    .or(z.number().or(z.string().array().or(z.boolean()))),
                ),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const leadFieldStructure = await ctx.db.leadFieldStructure.findUnique({
        where: { crmListId: input.crmListId },
        include: { customFields: true },
      });

      if (!leadFieldStructure) {
        throw new TRPCClientError("Lead structure not found!");
      }
      const requiredFields = Object.entries(leadFieldStructure)
        .filter(([fieldName, fieldConfig]) => {
          return (
            fieldName !== "crmListId" &&
            fieldConfig === true &&
            //@ts-expect-error
            leadFieldStructure[`${fieldName}Required`] === true
          );
        })
        .map(([fieldName]) => fieldName);

      for (const field of requiredFields) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        if (!input[field]) {
          throw new TRPCClientError(`Required field missing: ${field}`);
        }
      }

      if (leadFieldStructure.customFields.length !== 0) {
        const customFieldsMap = leadFieldStructure.customFields.reduce(
          (map, field) => {
            map[field.fieldName] = field;
            return map;
          },
          {} as Record<string, CustomField>,
        );
        if (!customFieldsMap) {
          throw new TRPCClientError(
            "Custom fields not found from lead structure.",
          );
        }
        const requiredCustomFields = leadFieldStructure.customFields.filter(
          (field) => field.required,
        );
        const inputRequiredCustomFields = input?.customFields?.filter((cf) => {
          const field = customFieldsMap[cf.fieldName];
          return field && field.required;
        });
        const inputNonRequiredCustomFields = input?.customFields?.filter(
          (cf) => {
            const field = customFieldsMap[cf.fieldName];
            return field && !field.required;
          },
        );

        const missingRequiredFields: string[] = [];

        for (const field of requiredCustomFields) {
          if (
            !inputRequiredCustomFields?.some(
              (cf) => cf.fieldName === field.fieldName,
            )
          ) {
            missingRequiredFields.push(field.fieldName);
          }
        }

        if (missingRequiredFields.length > 0) {
          const missingFieldsNames = missingRequiredFields.join(", ");
          throw new TRPCClientError(
            `Missing required custom fields: ${missingFieldsNames}`,
          );
        }

        const customFieldsData: any[] = [];
        if (inputRequiredCustomFields) {
          for (const customField of inputRequiredCustomFields) {
            const fieldName = customField.fieldName;
            const fieldValue = customField.fieldValue;

            if (!customFieldsMap[fieldName]) {
              throw new TRPCClientError(`Invalid custom field: ${fieldName}`);
            }
            const fieldType = customFieldsMap[fieldName].fieldType;

            if (!isFieldValueValid(fieldType, fieldValue)) {
              throw new TRPCClientError(
                `Invalid value for custom field: ${fieldName}`,
              );
            }

            customFieldsData.push({ fieldName, fieldValue });
          }
        }
        if (inputNonRequiredCustomFields) {
          for (const nonRequiredField of inputNonRequiredCustomFields) {
            const fieldName = nonRequiredField.fieldName;
            const fieldValue = nonRequiredField.fieldValue;

            if (!customFieldsMap[fieldName]) {
              throw new TRPCClientError(`Invalid custom field: ${fieldName}`);
            }
            const fieldType = customFieldsMap[fieldName].fieldType;

            if (!isFieldValueValid(fieldType, fieldValue)) {
              throw new TRPCClientError(
                `Invalid value for custom field: ${fieldName}`,
              );
            }

            customFieldsData.push({ fieldName, fieldValue });
          }
        }

        const currentLeadData = await ctx.db.lead.findUnique({
          where: { id: input.leadId },
        });

        if (!currentLeadData) {
          throw new TRPCClientError("Lead not found!");
        }

        const changedInformation: Record<string, string> = {};
        const addChangeToTimeline = (
          fieldName: string,
          currentValue:
            | string
            | number
            | boolean
            | Date
            | string[]
            | null
            | undefined,
          updatedValue:
            | string
            | number
            | boolean
            | Date
            | string[]
            | null
            | undefined,
        ) => {
          const areBooleanValuesEqual = (
            value1:
              | string
              | number
              | boolean
              | Date
              | string[]
              | null
              | undefined,
            value2:
              | string
              | number
              | boolean
              | Date
              | string[]
              | null
              | undefined,
          ) => {
            return value1 === value2 || Boolean(value1) === Boolean(value2);
          };

          if (
            // currentValue !== null &&
            updatedValue !== undefined &&
            currentValue !== updatedValue &&
            (!["boolean"].includes(typeof currentValue) ||
              !areBooleanValuesEqual(currentValue, updatedValue))
          ) {
            changedInformation[
              fieldName
            ] = `${currentValue?.toString()} to ${updatedValue?.toString()}`;
          }
        };
        if (!currentLeadData) {
          throw new TRPCClientError("Lead not found!");
        }

        addChangeToTimeline(
          "First Name",
          currentLeadData.firstName,
          input.firstName,
        );
        addChangeToTimeline(
          "Last Name",
          currentLeadData.lastName,
          input.lastName,
        );
        addChangeToTimeline("Company", currentLeadData.company, input.company);
        addChangeToTimeline(
          "Display Name",
          currentLeadData.displayName,
          input.displayName,
        );
        addChangeToTimeline("Email", currentLeadData.email, input.email);
        addChangeToTimeline("Website", currentLeadData.website, input.website);
        addChangeToTimeline(
          "Main Phone",
          currentLeadData.mainPhone,
          input.mainPhone,
        );
        addChangeToTimeline(
          "Mobile Phone",
          currentLeadData.mobilePhone,
          input.mobilePhone,
        );
        addChangeToTimeline(
          "Work Phone",
          currentLeadData.workPhone,
          input.workPhone,
        );
        addChangeToTimeline(
          "Fax Number",
          currentLeadData.faxNumber,
          input.faxNumber,
        );
        addChangeToTimeline(
          "Address Line 1",
          currentLeadData.addressLine1,
          input.addressLine1,
        );
        addChangeToTimeline(
          "Address Line 2",
          currentLeadData.addressLine2,
          input.addressLine2,
        );
        addChangeToTimeline(
          "Postal Code",
          currentLeadData.postalCode,
          input.postalCode,
        );
        addChangeToTimeline("City", currentLeadData.city, input.city);
        addChangeToTimeline("State", currentLeadData.state, input.state);
        addChangeToTimeline(
          "Start Date",
          currentLeadData.startDate,
          input.startDate,
        );
        addChangeToTimeline("End Date", currentLeadData.endDate, input.endDate);
        addChangeToTimeline("Status", currentLeadData.status, input.status);
        addChangeToTimeline("Notes", currentLeadData.notes, input.notes);
        // Add custom fields to the timeline
        if (input.customFields) {
          for (const customField of input.customFields) {
            const fieldName = customField.fieldName;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const currentCustomValue = currentLeadData.customFieldsData?.find(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              (field) => field.fieldName === fieldName,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
            )?.fieldValue;
            const updatedValue = customField.fieldValue;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            addChangeToTimeline(fieldName, currentCustomValue, updatedValue);
          }
        }
        await ctx.db.leadTimeline.create({
          data: {
            changedInformation: JSON.stringify(changedInformation),
            leadId: input.leadId,
          },
        });
        const updatedLead = await ctx.db.lead.update({
          where: {
            id: input.leadId,
          },
          data: {
            firstName: input.firstName,
            lastName: input.lastName,
            company: input.company,
            displayName: input.displayName,
            email: input.email,
            website: input.website,
            mainPhone: input.mainPhone,
            mobilePhone: input.mobilePhone,
            workPhone: input.workPhone,
            faxNumber: input.faxNumber,
            addressLine1: input.addressLine1,
            addressLine2: input.addressLine2,
            postalCode: input.postalCode,
            city: input.city,
            state: input.state,
            startDate: input.startDate,
            endDate: input.endDate,
            status: input.status,
            notes: input.notes,
            customFieldsData,
            crmList: {
              connect: {
                id: input.crmListId,
              },
            },
          },
        });

        return {
          success: true,
          message: "Lead created successfully for custom fields.",
          data: updatedLead,
        };
      }
      const currentLeadData = await ctx.db.lead.findUnique({
        where: { id: input.leadId },
      });

      if (!currentLeadData) {
        throw new TRPCClientError("Lead not found!");
      }

      const changedInformation: Record<string, string> = {};

      const addChangeToTimeline = (
        fieldName: string,
        currentValue:
          | string
          | number
          | boolean
          | Date
          | string[]
          | null
          | undefined,
        updatedValue:
          | string
          | number
          | boolean
          | Date
          | string[]
          | null
          | undefined,
      ) => {
        const areBooleanValuesEqual = (
          value1:
            | string
            | number
            | boolean
            | Date
            | string[]
            | null
            | undefined,
          value2:
            | string
            | number
            | boolean
            | Date
            | string[]
            | null
            | undefined,
        ) => {
          return value1 === value2 || Boolean(value1) === Boolean(value2);
        };

        if (
          // currentValue !== null &&
          updatedValue !== undefined &&
          currentValue !== updatedValue &&
          (!["boolean"].includes(typeof currentValue) ||
            !areBooleanValuesEqual(currentValue, updatedValue))
        ) {
          changedInformation[
            fieldName
          ] = `${currentValue?.toString()} to ${updatedValue?.toString()}`;
        }
      };
      if (!currentLeadData) {
        throw new TRPCClientError("Lead not found!");
      }
      addChangeToTimeline(
        "First Name",
        currentLeadData.firstName,
        input.firstName,
      );
      addChangeToTimeline(
        "Last Name",
        currentLeadData.lastName,
        input.lastName,
      );
      addChangeToTimeline("Company", currentLeadData.company, input.company);
      addChangeToTimeline(
        "Display Name",
        currentLeadData.displayName,
        input.displayName,
      );
      addChangeToTimeline("Email", currentLeadData.email, input.email);
      addChangeToTimeline("Website", currentLeadData.website, input.website);
      addChangeToTimeline(
        "Main Phone",
        currentLeadData.mainPhone,
        input.mainPhone,
      );
      addChangeToTimeline(
        "Mobile Phone",
        currentLeadData.mobilePhone,
        input.mobilePhone,
      );
      addChangeToTimeline(
        "Work Phone",
        currentLeadData.workPhone,
        input.workPhone,
      );
      addChangeToTimeline(
        "Fax Number",
        currentLeadData.faxNumber,
        input.faxNumber,
      );
      addChangeToTimeline(
        "Address Line 1",
        currentLeadData.addressLine1,
        input.addressLine1,
      );
      addChangeToTimeline(
        "Address Line 2",
        currentLeadData.addressLine2,
        input.addressLine2,
      );
      addChangeToTimeline(
        "Postal Code",
        currentLeadData.postalCode,
        input.postalCode,
      );
      addChangeToTimeline("City", currentLeadData.city, input.city);
      addChangeToTimeline("State", currentLeadData.state, input.state);
      addChangeToTimeline(
        "Start Date",
        currentLeadData.startDate,
        input.startDate,
      );
      addChangeToTimeline("End Date", currentLeadData.endDate, input.endDate);
      addChangeToTimeline("Status", currentLeadData.status, input.status);
      addChangeToTimeline("Notes", currentLeadData.notes, input.notes);
      await ctx.db.leadTimeline.create({
        data: {
          changedInformation: JSON.stringify(changedInformation),
          leadId: input.leadId,
        },
      });
      const updatedLead = await ctx.db.lead.update({
        where: {
          id: input.leadId,
        },
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          company: input.company,
          displayName: input.displayName,
          email: input.email,
          website: input.website,
          mainPhone: input.mainPhone,
          mobilePhone: input.mobilePhone,
          workPhone: input.workPhone,
          faxNumber: input.faxNumber,
          addressLine1: input.addressLine1,
          addressLine2: input.addressLine2,
          postalCode: input.postalCode,
          city: input.city,
          state: input.state,
          startDate: input.startDate,
          endDate: input.endDate,
          status: input.status,
          notes: input.notes,
        },
      });

      return {
        success: true,
        message: "Lead updated successfully.",
        data: updatedLead,
      };
    }),
  deleteLead: publicProcedure
    .input(
      z.object({
        leadId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const deletedLead = await ctx.db.lead.delete({
        where: { id: input.leadId },
      });

      if (!deletedLead) {
        throw new TRPCClientError("Lead not found!");
      }

      return {
        message: "Lead deleted successfully!",
        lead: deletedLead,
      };
    }),
  getLead: publicProcedure
    .input(
      z.object({
        leadId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const lead = await ctx.db.lead.findUnique({
        where: { id: input.leadId },
        include: {
          leadTimeline: true,
        },
      });

      if (!lead) {
        throw new TRPCClientError("Lead not found!");
      }

      return {
        lead,
      };
    }),
  updateStatus: publicProcedure
    .input(
      z.object({
        status: z.enum([
          "NEW_LEAD",
          "EASY_START",
          "QUALIFIED_LEAD",
          "OPENED",
          "IN_PROGRESS",
          "EMAILED",
          "CALLED",
          "SMS",
          "UNQUALIFIED",
          "ATTEMPTED_TO_CONTACT",
          "CONNECTED",
          "BAD_TIMING",
        ]),
        leadId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const leadData = await ctx.db.lead.findUnique({
        where: {
          id: input.leadId,
        },
        select: {
          status: true,
          crmListId: true,
          email: true,
        },
      });
      if (!leadData) {
        throw new TRPCClientError("Lead not found.");
      }

      const updatedLead = await ctx.db.lead.update({
        where: {
          id: input.leadId,
        },
        data: {
          status: input.status,
        },
      });
      const changedInformation: Record<string, string> = {};

      const addChangeToTimeline = (
        fieldName: string,
        currentValue:
          | string
          | number
          | boolean
          | Date
          | string[]
          | null
          | undefined,
        updatedValue:
          | string
          | number
          | boolean
          | Date
          | string[]
          | null
          | undefined,
      ) => {
        const areBooleanValuesEqual = (
          value1:
            | string
            | number
            | boolean
            | Date
            | string[]
            | null
            | undefined,
          value2:
            | string
            | number
            | boolean
            | Date
            | string[]
            | null
            | undefined,
        ) => {
          return value1 === value2 || Boolean(value1) === Boolean(value2);
        };

        if (
          currentValue !== null &&
          updatedValue !== undefined &&
          currentValue !== updatedValue &&
          (!["boolean"].includes(typeof currentValue) ||
            !areBooleanValuesEqual(currentValue, updatedValue))
        ) {
          changedInformation[
            fieldName
          ] = `${currentValue?.toString()} to ${updatedValue?.toString()}`;
        }
      };
      addChangeToTimeline("Status", leadData.status, input.status);
      await ctx.db.leadTimeline.create({
        data: {
          changedInformation: JSON.stringify(changedInformation),
          leadId: input.leadId,
        },
      });
      return updatedLead;
    }),

  getSingleLead: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.lead.findUnique({
        where: {
          id: input.id,
        },
      });
    }),

  getAllLeads: publicProcedure
    .input(
      z.object({
        crmListId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const leads = await ctx.db.lead.findMany({
        where: { crmListId: input.crmListId },
      });

      return {
        leads,
      };
    }),
  getAllLeadsForDND: publicProcedure
    .input(
      z.object({
        crmListId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const leads = await ctx.db.lead.findMany({
        where: { crmListId: input.crmListId },
      });

      return {
        leads,
      };
    }),
  deleteManyLeads: publicProcedure
    .input(
      z.object({
        leadIdsArray: z.string().array(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const deletedLeads = await ctx.db.lead.deleteMany({
        where: { id: { in: input.leadIdsArray } },
      });

      if (!deletedLeads) {
        throw new TRPCClientError("Lead not found!");
      }

      return {
        message: "Leads deleted successfully!",
        leads: deletedLeads,
      };
    }),
});

function isFieldValueValid(
  fieldType: string,
  fieldValue: (string | number | boolean | Date | string[]) &
    (string | number | boolean | Date | string[] | undefined),
): boolean {
  switch (fieldType) {
    case "DATE":
      return fieldValue === "" ? true : fieldValue instanceof Date;
    case "DECIMAL":
      return typeof fieldValue === "number";
    case "NUMBER":
      return typeof fieldValue === "number";
    case "TEXT":
      return typeof fieldValue === "string";
    case "BOOLEAN":
      return typeof fieldValue === "boolean";
    case "OPTIONLIST":
      return Array.isArray(fieldValue);
    default:
      return true;
  }
}
