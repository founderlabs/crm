/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { useRouter } from "next/router";
import React, { useState, useEffect, useMemo } from "react";

import MainLayout from "~/ui/layout/main-layout";

import ColumnContainer from "~/ui/components/column-container";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable } from "@dnd-kit/sortable";

import { api } from "~/utils/api";
import { getStatusLabel } from "~/utils";
import { ExportToCsv } from "export-to-csv";
import LeadFormModal from "~/ui/components/lead-form";
import { useBreadcrumbStore, useLeadStore, useCRMTogglerStore } from "~/store";

import { LoadingOverlay, Menu, ScrollArea } from "@mantine/core";
import {
  Button,
  TextInput,
  Select as MantineSelect,
  NumberInput,
  Modal,
  Group,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";

import {
  ArrowUpDown,
  ChevronDown,
  DeleteIcon,
  PlusIcon,
  TableIcon,
  MoreVertical,
  SearchIcon,
  DownloadIcon,
  Maximize,
  Trash2Icon,
} from "lucide-react";

import type {
  Column,
  Data,
  CustomField,
  CustomData,
  CustomFieldDataFromAPI,
} from "~/ui/types";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table";

import { Checkbox } from "~/ui/shadcn/checkbox";
import { DataTablePagination } from "~/ui/shadcn/table-pagination";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/ui/shadcn/table";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/ui/shadcn/dropdown-menu";

const columns = [
  {
    value: "NEW_LEAD",
    label: "New Lead",
  },
  {
    value: "EASY_START",
    label: "Easy Start",
  },
  {
    value: "QUALIFIED_LEAD",
    label: "Qualified Lead",
  },
  {
    value: "OPENED",
    label: "Opened",
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
  },
  {
    value: "EMAILED",
    label: "Emailed",
  },
  {
    value: "CALLED",
    label: "Called",
  },
  {
    value: "SMS",
    label: "SMS",
  },
  {
    value: "UNQUALIFIED",
    label: "Unqualified",
  },
  {
    value: "ATTEMPTED_TO_CONTACT",
    label: "Attempted to Contact",
  },
  {
    value: "CONNECTED",
    label: "Connected",
  },
  {
    value: "BAD_TIMING",
    label: "Bad Timing",
  },
];

export interface Lead {
  firstName: string;
  lastName: string;
  company: string;
  displayName: string;
  email: string;
  website: string;
  mainPhone: string;
  mobilePhone: string;
  workPhone: string;
  faxNumber: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  city: string;
  state: string;
  startDate: string;
  endDate: string;
  status: string;
  notes: string;
  [key: string]: string | number | boolean | Date | null;
}
export interface LeadDND {
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  displayName: string;
  email: string | null;
  website: string | null;
  mainPhone: string | null;
  mobilePhone: string | null;
  workPhone: string | null;
  faxNumber: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  postalCode: string | null;
  city: string | null;
  state: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string | null;
  notes: string;
  id: string;
}

interface LeadData {
  header: string;
  accessorKey: keyof Lead;
  value: string | number | boolean | Date | null;
}

const LeadsTable: React.FC = () => {
  const router = useRouter();
  const store = useBreadcrumbStore();
  const crmListId = router.query.id as string;
  const { isSubmitted } = useCRMTogglerStore();

  useEffect(() => {
    store.setBreadcrumbs([
      {
        label: "Data",
        link: "/dashboard",
      },
      {
        label: "Leads",
        link: "/dashboard/leads",
      },
    ]);
  }, []);

  const [nativeColumns, setNativeColumns] = useState<Column[]>([
    {
      header: "First Name",
      accessorKey: "firstName",
      show: false,
    },
    {
      header: "Last Name",
      accessorKey: "lastName",
      show: false,
    },
    {
      header: "Company",
      accessorKey: "company",
      show: false,
    },
    {
      header: "Display Name",
      accessorKey: "displayName",
      show: false,
    },
    {
      header: "Email",
      accessorKey: "email",
      show: false,
    },
    {
      header: "Website",
      accessorKey: "website",
      show: false,
    },
    {
      header: "Phone",
      accessorKey: "mainPhone",
      show: false,
    },
    {
      header: "Mobile Phone",
      accessorKey: "mobilePhone",
      show: false,
    },
    {
      header: "Office Phone",
      accessorKey: "workPhone",
      show: false,
    },
    {
      header: "Fax",
      accessorKey: "faxNumber",
      show: false,
    },
    {
      header: "Address Line 1",
      accessorKey: "addressLine1",
      show: false,
    },
    {
      header: "Address Line 2",
      accessorKey: "addressLine2",
      show: false,
    },
    {
      header: "Postal Code",
      accessorKey: "postalCode",
      show: false,
    },
    {
      header: "City",
      accessorKey: "city",
      show: false,
    },
    {
      header: "State",
      accessorKey: "state",
      show: false,
    },
    {
      header: "Start Date",
      accessorKey: "startDate",
      show: false,
    },
    {
      header: "End Date",
      accessorKey: "endDate",
      show: false,
    },
  ]);

  const [data, setData] = useState<Data[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    nativeColumns
      .filter((col: Column) => col.show)
      .map((col) => col.accessorKey),
  );
  const [search, setSearch] = useState<string>("");
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [customField, setCustomField] = useState<CustomField[]>([]);
  const [isBoardView, setIsBoardView] = useState<boolean>(false);
  const [tasks, setTasks] = useState<LeadDND[]>([]);
  const [updatedTasks, setUpdatedTasks] = useState({} as Data);
  const [isFormValidated, setIsFormValidated] = useState<boolean>(false);
  const [rowSelection, setRowSelection] = useState<Record<number, boolean>>({});
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  // const [sorting, setSorting] = React.useState<SortingState>([]);
  // const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
  //   [],
  // );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);

  const initialFormData: Data = {
    ...customField.reduce((acc, field) => {
      switch (field.type) {
        case "BOOLEAN":
          // @ts-ignore
          acc[field.accessorKey] = false;
          break;
        case "DECIMAL":
          // @ts-ignore
          acc[field.accessorKey] = 0.0;
          break;
        case "NUMBER":
          // @ts-ignore
          acc[field.accessorKey] = 0;
          break;
        case "TEXT":
          // @ts-ignore
          acc[field.accessorKey] = "";
          break;
        case "DATE":
          // @ts-ignore
          acc[field.accessorKey] = null;
          break;
        default:
          // @ts-ignore
          acc[field.accessorKey] = "";
          break;
      }
      return acc;
    }, {}),
  };

  const [formData, setFormData] = useState<Data>(initialFormData);

  const { data: allCrmLists } = api.crmList.getAllCrmList.useQuery();

  const customFieldsData = customField.filter((field) => field.accessorKey);

  const { data: getLeadStructure } =
    api.leadFieldStructure.getLeadStructure.useQuery({
      crmListId: crmListId,
    });

  useEffect(() => {
    getLeadStructure === null &&
      !isSubmitted &&
      void router.push(`/dashboard/crm/${crmListId}`);
  }, [getLeadStructure]);

  const utils = api.useContext();

  const { mutate: addLead } = api.lead.addLead.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      setFormData(initialFormData);
      close();
      notifications.show({
        title: "Lead Created Successfully",
        message: "Lead has been created successfully 🚀",
        autoClose: 5000,
        color: "green",
      });
    },
    onError: (error) => {
      console.error("Error creating lead:", error);
      notifications.show({
        title: "Failed to create lead. Please try again.",
        message: `Error: ${error.message}`,
        autoClose: 5000,
        color: "red",
      });
    },
  });

  const {
    data: allLeadsData,
    isLoading: allLeadLoading,
    refetch,
  } = api.lead.getAllLeads.useQuery({
    crmListId: crmListId,
  });

  const {
    isLoading: allLeadsForDNDLoading,
    mutate: getAllLeadsForDNDMutation,
  } = api.lead.getAllLeadsForDND.useMutation({
    onSuccess(value) {
      setTasks(value?.leads as LeadDND[]);
    },
  });

  useEffect(() => {
    getAllLeadsForDNDMutation({
      crmListId: crmListId,
    });
  }, [router.query]);

  const { mutate: deleteSelectedLeads } = api.lead.deleteManyLeads.useMutation({
    onSuccess: () => {
      void refetch();
      notifications.show({
        title: "Leads Deleted Successfully",
        message: "Leads has been deleted successfully 🚀",
        autoClose: 5000,
        color: "green",
      });
    },
    onError: (error) => {
      console.error("Error deleting leads:", error);
      notifications.show({
        title: "Error",
        message: "Failed to delete lead. Please try again.",
        autoClose: 5000,
        color: "red",
      });
    },
  });

  const { mutate: deleteCustomField } =
    api.leadFieldStructure.deleteCustomField.useMutation({
      onSuccess: (_, variables) => {
        const customFieldId = variables.customFieldId;
        setCustomField((prevCustomFields) =>
          prevCustomFields.filter((field) => field.id !== customFieldId),
        );
        setVisibleColumns((prevVisibleColumns) =>
          prevVisibleColumns.filter((col) => col !== customFieldId),
        );
        notifications.show({
          title: "Custom Field Deleted Successfully",
          message: "Awesome, you have successfully deleted the custom field 🚀",
          autoClose: 5000,
          color: "green",
        });
      },
      onError: (error) => {
        console.error("Error deleting custom field:", error);
      },
    });

  useEffect(() => {
    if (allLeadsData?.leads) {
      // @ts-ignore
      setData(allLeadsData.leads);
    }
  }, [allLeadsData]);

  const { mutateAsync } = api.lead.updateStatus.useMutation({
    onMutate() {
      notifications.show({
        title: "Updating the Status",
        message: "Please wait while we are updating the status.",
      });
    },
    onSuccess() {
      notifications.show({
        title: "Status Updated Successfully",
        message: "Hooray, Status Updated!!",
      });
      void refetch();
    },
  });

  useEffect(() => {
    if (getLeadStructure) {
      const updatedCustomFields = getLeadStructure.customFields.map(
        (customField: CustomFieldDataFromAPI) => ({
          id: customField.id,
          accessorKey: customField.fieldName,
          header: customField.fieldName,
          type: customField.fieldType,
          show: customField.fieldVisibility,
          required: customField.required,
          value: "",
        }),
      );
      setCustomField(updatedCustomFields);
    }
  }, [getLeadStructure, deleteCustomField]);

  useEffect(() => {
    if (getLeadStructure) {
      const updatedColumns = nativeColumns.map((col: Column) => ({
        ...col,
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        show: getLeadStructure[col.accessorKey],
      }));
      setNativeColumns(updatedColumns);

      const updatedVisibleColumns = updatedColumns
        .filter((col) => col.show)
        .map((col) => col.accessorKey);
      setVisibleColumns(updatedVisibleColumns);
    }
  }, [getLeadStructure]);

  const [opened, { open, close }] = useDisclosure(false);

  const requiredColumns = nativeColumns.filter((col) => col.show);
  const requiredCustomFields = customField.filter((field) => field.show);
  const isCustomField = (field: Column | CustomField): field is CustomField => {
    return "type" in field;
  };

  function isValidEmail(email: string | number | boolean | Date | undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email as string);
  }

  function isValidWebsite(
    website: string | number | boolean | Date | undefined,
  ) {
    const websiteRegex =
      /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-zA-Z0-9]+([-.][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}(\/.*)?$/;
    return websiteRegex.test(website as string);
  }

  function isValidPhoneNumber(
    phoneNumber: string | number | boolean | Date | undefined,
  ) {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneNumber as string);
  }

  function isValidFaxNumber(
    faxNumber: string | number | boolean | Date | undefined,
  ) {
    const faxRegex = /^\d{10}$/;
    return faxRegex.test(faxNumber as string);
  }

  function isValidPostCode(
    postCode: string | number | boolean | Date | undefined,
  ) {
    const postCodeRegex = /^\d{5}(?:-\d{4})?$/;
    return postCodeRegex.test(postCode as string);
  }

  const formFields = [...requiredColumns, ...requiredCustomFields].map(
    (field) => {
      let fieldError = false;

      if (!isCustomField(field)) {
        const isFieldRequired = getLeadStructure?.[
          `${field.accessorKey}Required` as keyof typeof getLeadStructure
        ] as boolean;

        if (
          ((isFieldRequired ||
            formData[field.accessorKey ?? ""] !== undefined) &&
            field.accessorKey === "email" &&
            !isValidEmail(formData[field.accessorKey ?? ""])) ||
          ((isFieldRequired ||
            formData[field.accessorKey ?? ""] !== undefined) &&
            field.accessorKey === "website" &&
            !isValidWebsite(formData[field.accessorKey ?? ""])) ||
          ((isFieldRequired ||
            formData[field.accessorKey ?? ""] !== undefined) &&
            field.accessorKey === "mainPhone" &&
            !isValidPhoneNumber(formData[field.accessorKey ?? ""])) ||
          ((isFieldRequired ||
            formData[field.accessorKey ?? ""] !== undefined) &&
            field.accessorKey === "mobilePhone" &&
            !isValidPhoneNumber(formData[field.accessorKey ?? ""])) ||
          ((isFieldRequired ||
            formData[field.accessorKey ?? ""] !== undefined) &&
            field.accessorKey === "faxNumber" &&
            !isValidFaxNumber(formData[field.accessorKey ?? ""])) ||
          ((isFieldRequired ||
            formData[field.accessorKey ?? ""] !== undefined) &&
            field.accessorKey === "workPhone" &&
            !isValidPhoneNumber(formData[field.accessorKey ?? ""])) ||
          ((isFieldRequired ||
            formData[field.accessorKey ?? ""] !== undefined) &&
            field.accessorKey === "postalCode" &&
            !isValidPostCode(formData[field.accessorKey ?? ""]))
        ) {
          fieldError = true;
        }
      } else {
        const customFieldInfo = getLeadStructure?.customFields?.find(
          (customField) => customField.fieldName === field.accessorKey,
        );

        if (customFieldInfo) {
          return (
            <div key={field.accessorKey} className="flex flex-col gap-2">
              {/* <label className="text-sm">{field.accessorKey}</label> */}
              {field.type === "BOOLEAN" ? (
                <MantineSelect
                  label={field.accessorKey}
                  className="w-full"
                  required={
                    getLeadStructure?.customFields?.find(
                      (customField) =>
                        customField.fieldName === field.accessorKey,
                    )?.required
                  }
                  withAsterisk={
                    getLeadStructure?.customFields?.find(
                      (customField) =>
                        customField.fieldName === field.accessorKey,
                    )?.required
                  }
                  data={[
                    { label: "Yes", value: "true" },
                    { label: "No", value: "false" },
                  ]}
                  value={formData[field.accessorKey] as string}
                  onChange={(value: string) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      [field.accessorKey]: value,
                    }))
                  }
                  placeholder="Select a Boolean value"
                />
              ) : field.type === "NUMBER" ? (
                <NumberInput
                  label={field.accessorKey}
                  className="w-full"
                  required={
                    getLeadStructure?.customFields?.find(
                      (customField) =>
                        customField.fieldName === field.accessorKey,
                    )?.required
                  }
                  withAsterisk={
                    getLeadStructure?.customFields?.find(
                      (customField) =>
                        customField.fieldName === field.accessorKey,
                    )?.required
                  }
                  defaultValue={0}
                  value={formData[field.accessorKey] as number}
                  onChange={(value) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      [field.accessorKey]: value,
                    }))
                  }
                  placeholder="Enter Number"
                />
              ) : field.type === "DECIMAL" ? (
                <NumberInput
                  label={field.accessorKey}
                  className="w-full"
                  required={
                    getLeadStructure?.customFields?.find(
                      (customField) =>
                        customField.fieldName === field.accessorKey,
                    )?.required
                  }
                  withAsterisk={
                    getLeadStructure?.customFields?.find(
                      (customField) =>
                        customField.fieldName === field.accessorKey,
                    )?.required
                  }
                  defaultValue={0.01}
                  step={0.01}
                  value={formData[field.accessorKey] as number}
                  onChange={(value) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      [field.accessorKey]: value,
                    }))
                  }
                  placeholder="Enter Decimal"
                />
              ) : field.type === "TEXT" ? (
                <TextInput
                  label={field.accessorKey}
                  required={
                    getLeadStructure?.customFields?.find(
                      (customField) =>
                        customField.fieldName === field.accessorKey,
                    )?.required
                  }
                  withAsterisk={
                    getLeadStructure?.customFields?.find(
                      (customField) =>
                        customField.fieldName === field.accessorKey,
                    )?.required
                  }
                  className="w-full"
                  value={formData[field.accessorKey] as string}
                  onChange={(event) => {
                    const newValue = event.currentTarget?.value || "";
                    setFormData((prevData) => ({
                      ...prevData,
                      [field.accessorKey]: newValue || "",
                    }));
                  }}
                  placeholder={`Enter ${field.accessorKey}`}
                />
              ) : field.type === "DATE" ? (
                <DatePickerInput
                  label={field.accessorKey}
                  className="w-full"
                  required={
                    getLeadStructure?.customFields?.find(
                      (customField) =>
                        customField.fieldName === field.accessorKey,
                    )?.required
                  }
                  withAsterisk={
                    getLeadStructure?.customFields?.find(
                      (customField) =>
                        customField.fieldName === field.accessorKey,
                    )?.required
                  }
                  value={formData[field.accessorKey] as Date}
                  onChange={(value) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      [field.accessorKey]: value!,
                    }))
                  }
                  placeholder="Select a Date"
                />
              ) : null}
            </div>
          );
        }
      }

      // if (isCustomField(field)) {
      // } else {
      return (
        <div key={field.accessorKey} className="flex flex-col gap-2">
          {field.accessorKey === "startDate" ||
          field.accessorKey === "endDate" ? (
            <DatePickerInput
              label={field.header}
              className="w-full"
              required={
                getLeadStructure?.[
                  `${field.accessorKey}Required` as keyof typeof getLeadStructure
                ] as boolean
              }
              withAsterisk={
                getLeadStructure?.[
                  `${field.accessorKey}Required` as keyof typeof getLeadStructure
                ] as boolean
              }
              value={formData[field.accessorKey] as Date}
              onChange={(value) =>
                setFormData((prevData) => ({
                  ...prevData,
                  [field.accessorKey ?? ""]: value!,
                }))
              }
              placeholder="Select a Date"
            />
          ) : (
            <TextInput
              label={field.header}
              className="w-full"
              required={
                getLeadStructure?.[
                  `${field.accessorKey}Required` as keyof typeof getLeadStructure
                ] as boolean
              }
              withAsterisk={
                getLeadStructure?.[
                  `${field.accessorKey}Required` as keyof typeof getLeadStructure
                ] as boolean
              }
              value={formData[field.accessorKey ?? ""] as string}
              error={
                String(formData[field.accessorKey ?? ""]).length !== 0
                  ? fieldError
                    ? true
                    : false
                  : null
              }
              onChange={(event) => {
                const newValue = event.currentTarget?.value || "";
                setFormData((prevData) => ({
                  ...prevData,
                  [field.accessorKey ?? ""]: newValue,
                }));
              }}
              placeholder={
                field.accessorKey === "mainPhone" ||
                field.accessorKey === "mobilePhone" ||
                field.accessorKey === "workPhone" ||
                field.accessorKey === "faxNumber"
                  ? `Enter 10-digit ${field.header}`
                  : `Enter ${field.header}`
              }
            />
          )}
        </div>
      );
      // }
    },
  );

  const formErrors = formFields.some(
    (field) => field?.props?.children?.props?.error === true,
  );

  useEffect(() => {
    setIsFormValidated(formErrors);
  }, [formErrors]);

  const newCustomFields: CustomData[] = customFieldsData.map((field) => {
    const remainValue =
      field.type === "NUMBER"
        ? 0
        : field.type === "DECIMAL"
        ? 0.0
        : field.type === "TEXT"
        ? ""
        : "";

    return {
      fieldName: field.accessorKey,
      fieldValue:
        field.type === "BOOLEAN"
          ? formData[field.accessorKey] === "true"
          : formData[field.accessorKey] || remainValue,
    };
  });

  const csvData = data.map((item) => {
    const { id, createdAt, updatedAt, crmListId, customFieldsData, ...rest } =
      item;

    const filteredItem = Object.fromEntries(
      Object.entries(rest).filter(([key, value]) => value !== null),
    );

    const customFields: Record<string, any> = {};

    if (Array.isArray(customFieldsData)) {
      customFieldsData.forEach((field) => {
        if (field.fieldName && typeof field.fieldName === "string") {
          customFields[field.fieldName] = field.fieldValue;
        }
      });
    }

    const result = {
      ...filteredItem,
      ...customFields,
    };

    return result;
  });

  const uniqueCsvHeadersSet = new Set();
  for (const obj of csvData) {
    for (const key in obj) {
      if (obj[key] !== null) {
        uniqueCsvHeadersSet.add(key);
      }
    }
  }

  const uniqueCsvHeaders = Array.from(uniqueCsvHeadersSet);

  const csvOptions = {
    fieldSeparator: ",",
    quoteStrings: '"',
    decimalSeparator: ".",
    showLabels: true,
    useBom: true,
    useKeysAsHeaders: false,
    headers: uniqueCsvHeaders as string[],
  };

  const csvExporter = new ExportToCsv(csvOptions);

  const handleExportData = () => {
    csvExporter.generateCsv(csvData);
  };

  const handleFormSubmit = () => {
    const hasEmptyRequiredColumn = formFields.some((field) => {
      const { required, value } = field?.props?.children?.props || {};
      return required === true && (value === "" || value === undefined);
    });

    const hasEmptyRequiredCustomField = customFieldsData.some((field) => {
      const fieldValue = formData[field.accessorKey];
      if (field.required && fieldValue === "") {
        return true;
      }

      if (field.required) {
        if (field.type === "BOOLEAN") {
          return fieldValue !== "true" && fieldValue !== "false";
        }
      }

      if (field.required && fieldValue === "") {
        return true;
      }

      return false;
    });

    if (hasEmptyRequiredColumn || hasEmptyRequiredCustomField) {
      notifications.show({
        title: "Error",
        message: "Please fill all required fields",
        color: "red",
      });
      return;
    }

    if (Object.keys(formData).length === 0) {
      return;
    }

    const newNativeFields: Data = {};

    Object.entries(formData).forEach(([key, value]) => {
      if (!customFieldsData.find((field) => field.accessorKey === key)) {
        newNativeFields[key] = value;
      }
    });

    const newDataWithCustomFields = {
      ...newNativeFields,
      customFields: newCustomFields,
      crmListId: crmListId,
    };

    // @ts-ignore
    addLead(newDataWithCustomFields);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const visibleData = data.filter((row) =>
    Object.values(row).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(search.toLowerCase()),
    ),
  );

  const { setLeadData, setLeadId, setCRMListId } = useLeadStore();

  const getCRMNameById = (crmListId: string) => {
    const crmList = allCrmLists?.find((crm_list) => crm_list.id === crmListId);
    return crmList ? crmList.name : "Leads";
  };

  // for DND
  const columnsId = useMemo(() => columns.map((col) => col.value), [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (updatedTasks.id) {
      void mutateAsync({
        leadId: updatedTasks.id as string,
        status: updatedTasks.status as
          | "NEW_LEAD"
          | "EASY_START"
          | "QUALIFIED_LEAD"
          | "OPENED"
          | "IN_PROGRESS"
          | "EMAILED"
          | "CALLED"
          | "SMS"
          | "UNQUALIFIED"
          | "ATTEMPTED_TO_CONTACT"
          | "CONNECTED"
          | "BAD_TIMING",
      });
    }
    if (activeId === overId) return;

    const isActiveAColumn = active.data.current?.type === "Column-crm";
    if (!isActiveAColumn) return;
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks?.findIndex((t) => t.id === activeId);
        const overIndex = tasks?.findIndex((t) => t.id === overId);
        //@ts-ignore

        if (tasks[activeIndex].status != tasks[overIndex].status) {
          //@ts-ignore

          tasks[activeIndex].status = tasks[overIndex].status;
          //@ts-ignore
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }
        //@ts-ignore
        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column-crm";

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks?.findIndex((t) => t.id === activeId);
        //@ts-ignore
        tasks[activeIndex].status = overId;

        //@ts-ignore
        setUpdatedTasks(tasks[activeIndex]);

        //@ts-ignore
        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }

  const dataForReactTable: Data[] = useMemo(
    () =>
      data?.map((lead) => {
        const row = {
          id: lead.id,
          // Map native columns
          ...nativeColumns.reduce(
            (
              acc: Record<string, string | number | boolean | Date | null>,
              col,
            ) => {
              if (
                col.accessorKey === "startDate" ||
                col.accessorKey === "endDate"
              ) {
                acc[col.accessorKey] =
                  lead[col.accessorKey]?.toString() || null;
              } else {
                const accessedValue = lead[col.accessorKey];
                acc[col.accessorKey ?? ""] =
                  typeof accessedValue === "string" ||
                  typeof accessedValue === "number" ||
                  typeof accessedValue === "boolean" ||
                  accessedValue instanceof Date
                    ? accessedValue
                    : null;
              }
              return acc;
            },
            {},
          ),
          // Map custom fields
          ...(lead?.customFieldsData && Array.isArray(lead?.customFieldsData)
            ? lead.customFieldsData.reduce(
                (
                  acc: Record<string, string | number | boolean | Date | null>,
                  field: CustomData,
                ) => {
                  if (
                    field.fieldValue !== null &&
                    field.fieldValue !== undefined
                  ) {
                    acc[field.fieldName] = String(field.fieldValue);
                  } else {
                    acc[field.fieldName ?? ""] = null;
                  }
                  return acc;
                },
                {},
              )
            : {}),
          status: getStatusLabel(String(lead.status) || ""),
          notes: lead.notes || "",
        };
        return row;
      }),
    [data, nativeColumns],
  );

  const filterData = (data: Data[], query: string) => {
    if (!query) return data;

    query = query.toLowerCase();

    return data.filter((lead) => {
      return (
        (typeof lead.email === "string" &&
          lead.email.toLowerCase().includes(query)) ||
        (typeof lead.company === "string" &&
          lead.company.toLowerCase().includes(query)) ||
        (typeof lead.firstName === "string" &&
          lead.firstName.toLowerCase().includes(query)) ||
        (typeof lead.lastName === "string" &&
          lead.lastName.toLowerCase().includes(query)) ||
        (typeof lead.website === "string" &&
          lead.website.toLowerCase().includes(query)) ||
        (typeof lead.city === "string" &&
          lead.city.toLowerCase().includes(query)) ||
        (typeof lead.faxNumber === "string" &&
          lead.faxNumber.includes(query)) ||
        (typeof lead.mainPhone === "string" &&
          lead.mainPhone.includes(query)) ||
        (typeof lead.mobilePhone === "string" &&
          lead.mobilePhone.includes(query)) ||
        (typeof lead.workPhone === "string" &&
          lead.workPhone.includes(query)) ||
        (typeof lead.addressLine1 === "string" &&
          lead.addressLine1.includes(query)) ||
        (typeof lead.addressLine2 === "string" &&
          lead.addressLine2.includes(query)) ||
        (typeof lead.state === "string" &&
          lead.state.toLowerCase().includes(query)) ||
        (typeof lead.postalCode === "string" &&
          lead.postalCode.includes(query)) ||
        (typeof lead.status === "string" &&
          lead.status.toLowerCase().includes(query)) ||
        (typeof lead.notes === "string" &&
          lead.notes.toLowerCase().includes(query)) ||
        Object.keys(lead)
          .filter((fieldName) => fieldName !== "id")
          .some((fieldName) => {
            const fieldValue = lead[fieldName];
            return (
              fieldValue !== null &&
              fieldValue !== undefined &&
              String(fieldValue).includes(query)
            );
          })
      );
    });
  };

  const filteredData = useMemo(() => {
    return filterData(dataForReactTable, searchQuery);
  }, [dataForReactTable, searchQuery]);

  const handleLeadClick = (leadId: string) => {
    const clickedLead = data.find((lead) => lead.id === leadId);

    if (clickedLead) {
      const leadData: (LeadData | CustomData)[] = nativeColumns
        .filter((col) => visibleColumns.includes(col.accessorKey))
        .map((col) => {
          const accessorKey = col.accessorKey as keyof Lead;

          let initialColumnValue;

          switch (accessorKey) {
            case "firstName":
            case "lastName":
            case "company":
            case "displayName":
            case "email":
            case "website":
            case "mainPhone":
            case "mobilePhone":
            case "workPhone":
            case "faxNumber":
            case "addressLine1":
            case "addressLine2":
            case "postalCode":
            case "city":
            case "state":
              initialColumnValue = "";
              break;
            case "startDate":
            case "endDate":
              initialColumnValue = null;
              break;
            default:
              initialColumnValue = null;
          }

          const value = clickedLead[accessorKey] || null;
          return {
            header: col.header,
            accessorKey: accessorKey,
            value: value === null ? initialColumnValue : value,
          };
        });

      customField
        .filter((field) => field.show)
        .forEach((customField: CustomField) => {
          const accessorKey: string = customField.accessorKey;
          // @ts-ignore
          const value = clickedLead.customFieldsData?.find(
            (field: CustomData) => field.fieldName === customField.accessorKey,
          )?.fieldValue;

          let initialCustomValue;

          switch (customField.type) {
            case "TEXT":
              initialCustomValue = "";
              break;
            case "NUMBER":
              initialCustomValue = 0;
              break;
            case "BOOLEAN":
              initialCustomValue = false;
              break;
            case "DATE":
              initialCustomValue = null;
              break;
            case "DECIMAL":
              initialCustomValue = 0.0;
              break;
            default:
              initialCustomValue = null;
          }

          const assignedValue =
            typeof value === "string" &&
            (value.toLowerCase() === "true" || value.toLowerCase() === "false")
              ? value.toLowerCase() === "true"
              : value !== null && value !== undefined
              ? value
              : initialCustomValue;

          leadData.push({
            header: accessorKey,
            accessorKey: accessorKey,
            value: assignedValue,
            type: customField.type,
          });
        });

      let initialStatusValue;

      switch (clickedLead.status) {
        case "New Lead":
          initialStatusValue = "NEW_LEAD";
          break;
        case "Easy Start":
          initialStatusValue = "EASY_START";
          break;
        case "Qualified Lead":
          initialStatusValue = "QUALIFIED_LEAD";
          break;
        case "Opened":
          initialStatusValue = "OPENED";
          break;
        case "In Progress":
          initialStatusValue = "IN_PROGRESS";
          break;
        case "Emailed":
          initialStatusValue = "EMAILED";
          break;
        case "SMS":
          initialStatusValue = "SMS";
          break;
        case "Unqualified":
          initialStatusValue = "UNQUALIFIED";
          break;
        case "Attempted to Contact":
          initialStatusValue = "ATTEMPTED_TO_CONTACT";
          break;
        case "Connected":
          initialStatusValue = "CONNECTED";
          break;
        case "Bad Timing":
          initialStatusValue = "BAD_TIMING";
          break;
        default:
          initialStatusValue = "NEW_LEAD";
      }

      leadData.push(
        {
          header: "Status",
          accessorKey: "status",
          value: initialStatusValue || "",
        },
        {
          header: "Notes",
          accessorKey: "notes",
          value: clickedLead.notes || "",
        },
      );

      setLeadId(leadId || "");
      setCRMListId(crmListId);
      // @ts-ignore
      setLeadData(leadData);

      void router.push(`/dashboard/leads/general`);
    }
  };

  type TableColumn = ColumnDef<Data> & { show: boolean };
  type CustomFieldColumn = ColumnDef<Data> & { show: boolean };

  type ExtendedColumnDef = TableColumn | CustomFieldColumn;

  const columnsForReactTable: ExtendedColumnDef[] = useMemo(() => {
    const visibleNativeColumns = nativeColumns.filter((col) => col.show);
    const requiredCustomFields = customField.filter((field) => field.show);

    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            className="border-black"
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value);
              const allIds = dataForReactTable.map((row) => row.id);
              setSelectedRowIds(
                table.getIsAllPageRowsSelected() ? [] : (allIds as string[]),
              );
            }}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            className="border-black"
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
              const rowOriginal = row.original;
              const rowId = rowOriginal.id;
              if (value) {
                setSelectedRowIds(
                  (prevSelectedRowIds) =>
                    [...prevSelectedRowIds, rowId] as string[],
                );
              } else {
                setSelectedRowIds((prevSelectedRowIds) =>
                  prevSelectedRowIds.filter((id) => id !== rowId),
                );
              }
            }}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      ...visibleNativeColumns,
      ...requiredCustomFields,
      {
        header: "Status",
        accessorKey: "status",
        show: true,
      },
      {
        header: "Notes",
        accessorKey: "notes",
        show: true,
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const lead = row.original;

          return (
            // <DropdownMenu>
            //   <DropdownMenuTrigger asChild className="bg-white">
            //     <Button variant="ghost" className="h-8 w-8 p-0">
            //       <span className="sr-only">Open menu</span>
            <Maximize
              className="h-4 w-4 cursor-pointer"
              onClick={() => {
                handleLeadClick(lead.id as string);
              }}
            />
            //     </Button>
            //   </DropdownMenuTrigger>
            //   <DropdownMenuContent className="bg-white" align="end">
            //     <DropdownMenuLabel>Actions</DropdownMenuLabel>
            //     <DropdownMenuItem
            //       onClick={() =>
            //         navigator.clipboard.writeText(lead.id as string)
            //       }
            //     >
            //       Copy lead ID
            //     </DropdownMenuItem>
            //     <DropdownMenuSeparator />
            //     <DropdownMenuItem
            //       onClick={() => {
            //         visibleData?.forEach((lead) => {
            //           handleLeadClick(lead.id as string);
            //         });
            //       }}
            //     >
            //       View lead details
            //     </DropdownMenuItem>
            //   </DropdownMenuContent>
            // </DropdownMenu>
          );
        },
      },
    ] as ExtendedColumnDef[];
  }, [nativeColumns, customField, dataForReactTable]);

  const table = useReactTable({
    data: filteredData,
    columns: columnsForReactTable,
    enableRowSelection: true,
    state: {
      rowSelection,
      // sorting,
      // columnFilters,
      columnVisibility,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    // onColumnFiltersChange: setColumnFilters,
    // getFilteredRowModel: getFilteredRowModel(),
    // getSortedRowModel: getSortedRowModel(),
  });

  if (allLeadLoading || allLeadsForDNDLoading)
    return (
      //   <MainLayout>
      <div className="bg-primary flex h-full flex-col md:gap-3 md:p-3">
        <div className="w-full rounded bg-white px-2 text-gray-600 shadow-md md:p-4">
          <LoadingOverlay visible={true} overlayBlur={2} />
        </div>
      </div>
      //   </MainLayout>
    );

  return (
    <MainLayout>
      <Modal
        opened={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        size="sm"
        centered
        title="Confirmation"
      >
        <div className="pb-4">Are you sure you want to delete the leads?</div>
        <Group>
          <Button
            className="bg-gray-300 text-sm font-normal hover:bg-gray-400"
            onClick={() => setShowConfirmationModal(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-red-600 text-sm font-normal hover:bg-red-700"
            onClick={() => {
              deleteSelectedLeads({ leadIdsArray: selectedRowIds });
              setShowConfirmationModal(false);
            }}
          >
            Delete
          </Button>
        </Group>
      </Modal>
      <div className="bg-primary flex h-full flex-col md:gap-3 md:p-3">
        <div className="w-full rounded bg-white px-2 text-gray-600 shadow-md md:p-4">
          <h1 className="mb-4 text-center text-2xl leading-10">
            {getCRMNameById(crmListId)}
          </h1>
          {showFormModal && (
            <LeadFormModal
              close={close}
              opened={opened}
              formFields={formFields}
              isFormValidated={isFormValidated}
              handleFormSubmit={handleFormSubmit}
            />
          )}

          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4 md:flex-nowrap md:gap-0">
              <TextInput
                className=" w-full md:w-[250px]"
                placeholder="Search event, date, brand"
                rightSection={<SearchIcon size="1rem" />}
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <div className="flex w-full flex-wrap  justify-end gap-2 md:w-auto md:justify-center md:gap-4">
                <div className="flex gap-2">
                  <button onClick={() => setIsBoardView((prev) => !prev)}>
                    {isBoardView ? (
                      <TableIcon className="text-black" />
                    ) : (
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="0.5"
                          y="0.5"
                          width="31"
                          height="31"
                          rx="2.5"
                          stroke="#3D487D"
                        />
                        <path
                          d="M9.99997 6.85712H22C22.2273 6.85712 22.4453 6.95344 22.6061 7.1249C22.7668 7.29637 22.8571 7.52892 22.8571 7.7714V16.9143C22.8571 17.1567 22.7668 17.3893 22.6061 17.5608C22.4453 17.7322 22.2273 17.8285 22 17.8285H9.99997C9.77264 17.8285 9.55462 17.7322 9.39387 17.5608C9.23313 17.3893 9.14282 17.1567 9.14282 16.9143V7.7714C9.14282 7.52892 9.23313 7.29637 9.39387 7.1249C9.55462 6.95344 9.77264 6.85712 9.99997 6.85712ZM10.8571 8.68569V16H21.1428V8.68569H10.8571ZM22.8571 20.5714C22.8571 20.8139 22.7668 21.0464 22.6061 21.2179C22.4453 21.3894 22.2273 21.4857 22 21.4857H9.99997C9.77264 21.4857 9.55462 21.3894 9.39387 21.2179C9.23313 21.0464 9.14282 20.8139 9.14282 20.5714V19.6571H22.8571V20.5714ZM22.8571 24.2285C22.8571 24.471 22.7668 24.7036 22.6061 24.875C22.4453 25.0465 22.2273 25.1428 22 25.1428H9.99997C9.77264 25.1428 9.55462 25.0465 9.39387 24.875C9.23313 24.7036 9.14282 24.471 9.14282 24.2285V23.3143H22.8571V24.2285Z"
                          fill="#000"
                        />
                      </svg>
                    )}
                  </button>
                  <Button
                    variant="filled"
                    onClick={handleExportData}
                    leftIcon={<DownloadIcon />}
                    disabled={!getLeadStructure}
                    className="bg-black"
                  >
                    Export All Data
                  </Button>
                  <Button
                    className="w-full bg-black md:w-auto md:max-w-full"
                    disabled={!getLeadStructure}
                    onClick={() => {
                      setFormData(initialFormData);
                      setShowFormModal(true);
                      open();
                    }}
                  >
                    <PlusIcon />
                    <span className="pl-2 text-white">Add Lead</span>
                  </Button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowConfirmationModal(true);
                      // handleDeleteLead(checkedItems[0] || "")
                    }}
                  >
                    <Trash2Icon />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      className="border-black bg-white text-black"
                    >
                      <Button variant="outline" className="ml-auto">
                        Columns{" "}
                        <ChevronDown className="ml-2 h-4 w-4 text-black" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="overflow-x-scroll bg-white"
                    >
                      <ScrollArea h={250}>
                        {table
                          .getAllColumns()
                          .filter((column) => column.getCanHide())
                          .map((column) => {
                            return (
                              <DropdownMenuCheckboxItem
                                key={column.id}
                                className="capitalize"
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) =>
                                  column.toggleVisibility(!!value)
                                }
                              >
                                {column.columnDef.header as string}
                              </DropdownMenuCheckboxItem>
                            );
                          })}
                      </ScrollArea>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="flex items-center">
                    <Menu trigger="click" shadow="md" width={200}>
                      <Menu.Target>
                        <MoreVertical />
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          onClick={() =>
                            void router.push(`/dashboard/crm/${crmListId}`)
                          }
                        >
                          Lead Structure
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </div>
                </div>
              </div>
            </div>

            {isBoardView ? (
              <div className="overflow-scroll">
                <DndContext
                  sensors={sensors}
                  onDragEnd={onDragEnd}
                  onDragOver={onDragOver}
                >
                  <div className="m-auto flex gap-4">
                    <div className="flex gap-4 overflow-scroll">
                      {/* @ts-ignore */}
                      <SortableContext items={columnsId}>
                        {columns.map((col) => (
                          <ColumnContainer
                            open={open}
                            column={col}
                            key={col.value}
                            handleLeadClick={handleLeadClick}
                            tasks={tasks.filter(
                              (task) => task.status === col.value,
                            )}
                          />
                        ))}
                      </SortableContext>
                    </div>
                  </div>
                </DndContext>
              </div>
            ) : (
              <div className="w-full">
                {visibleColumns.length > 0 ? (
                  <>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                              {headerGroup.headers.map((header) => {
                                return (
                                  <TableHead key={header.id}>
                                    {header.isPlaceholder
                                      ? null
                                      : flexRender(
                                          header.column.columnDef.header,
                                          header.getContext(),
                                        )}
                                  </TableHead>
                                );
                              })}
                            </TableRow>
                          ))}
                        </TableHeader>
                        <TableBody>
                          {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row, index) => (
                              <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                              >
                                {row.getVisibleCells().map((cell) => (
                                  <TableCell key={cell.id}>
                                    {cell.id === `${index}_startDate` ||
                                    cell.id === `${index}_endDate`
                                      ? new Date(
                                          row.getValue(cell.column.id),
                                        ).toDateString()
                                      : // @ts-ignore
                                      cell.column.columnDef?.type === "DATE"
                                      ? new Date(
                                          row.getValue(cell.column.id),
                                        ).toDateString()
                                      : flexRender(
                                          cell.column.columnDef.cell,
                                          cell.getContext(),
                                        )}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                              >
                                No results.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                ) : null}
              </div>
            )}
            <DataTablePagination table={table} />
          </>
        </div>
      </div>
    </MainLayout>
  );
};

export default LeadsTable;
