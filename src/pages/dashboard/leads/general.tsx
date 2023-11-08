/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { useRouter } from "next/router";
import React, { useState, useEffect, useRef } from "react";

import MainLayout from "~/ui/layout/MainLayout";

import { api } from "~/utils/api";
import { useBreadcrumbStore, useLeadStore } from "~/store";

import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import {
  TextInput,
  NumberInput,
  Select,
  Button,
  Modal,
  Group,
} from "@mantine/core";

import { getStatusLabel } from "~/utils";

import type {
  DataState,
  LeadDataItem,
  CustomData,
  LeadsDataType as Data,
} from "~/ui/types";
import { PencilIcon, SaveIcon } from "lucide-react";

export function convertToData(leadData: LeadDataItem[] | null): Data[] {
  if (!Array.isArray(leadData)) {
    return [];
  }

  return leadData.map((item) => ({
    accessorKey: item.accessorKey,
    header: item.header,
    value:
      item.type === "DATE" && item.value ? new Date(item.value) : item.value,
    type: item.type,
  }));
}

function Update() {
  const router = useRouter();
  const { setBreadcrumbs } = useBreadcrumbStore();
  const { setLeadData, leadId, leadData, crmListId } = useLeadStore();

  useEffect(() => {
    !leadId && void router.back();

    setBreadcrumbs([
      {
        label: "Data",
        link: "/dashboard/data",
      },
      {
        label: "Leads",
        link: "/dashboard/data/leads",
      },
      {
        label: "General",
        link: "/dashboard/data/leads",
      },
    ]);
  }, []);

  const nativeAccessors = [
    "firstName",
    "lastName",
    "company",
    "displayName",
    "email",
    "website",
    "mainPhone",
    "mobilePhone",
    "workPhone",
    "faxNumber",
    "addressLine1",
    "addressLine2",
    "postalCode",
    "city",
    "state",
    "startDate",
    "endDate",
    "status",
    "notes",
  ];

  const customAccessors =
    leadData
      .map((item) => item.accessorKey)
      .filter((accessorKey) => !nativeAccessors.includes(accessorKey)) || [];

  const { mutate: updateLead } = api.lead.updateLead.useMutation();

  type PartialDataState = Partial<DataState>;

  function filterNonEmptyProperties(data: DataState): PartialDataState {
    return Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== null),
    ) as PartialDataState;
  }

  const [data, setData] = useState<DataState>(
    () =>
      // @ts-ignore
      filterNonEmptyProperties({
        leadId: leadId || "",
        crmListId: crmListId,
      }) as DataState,
  );
  const [filteredLeadData, setFilteredLeadData] = useState<Data[]>([]);
  const [clickedToUpdateAccessor, setClickedToUpdateAccessor] = useState<
    string | null
  >(null);
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState<boolean>(false);
  const [newRoute, setNewRoute] = useState<string | null>(null);
  const isNavigationConfirmedRef = useRef<boolean>(false);
  const [isInitialSaved, setIsInitialSaved] = useState<boolean>(false);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsEditing(false);
        setClickedToUpdateAccessor(null);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  useEffect(() => {
    const convertedData = convertToData(leadData);
    setFilteredLeadData(convertedData);
  }, [leadData]);

  useEffect(() => {
    // @ts-ignore
    const initialData: Partial<DataState> = {};
    filteredLeadData.forEach((item) => {
      // @ts-ignore
      initialData[item.accessorKey] = item.value ?? null;
    });
    setData((prevData) => ({ ...prevData, ...initialData }) as DataState);
  }, [filteredLeadData]);

  const handleEditLead = (itemAccessor: string) => {
    setClickedToUpdateAccessor(itemAccessor);
    setIsEditing(true);
  };

  const handleTextInputChange = (
    itemAccessor: string,
    value: string | number | boolean | Date | null,
    item: Data,
  ) => {
    let newIsSaveDisabled = false;

    if (typeof value === "string") {
      if (item.type === "BOOLEAN") {
        if (value === "true") {
          value = true;
        } else if (value === "false") {
          // } else if (value === "false" || value === "") {
          value = false;
        }
      } else if (
        item.type === "DATE" ||
        item.accessorKey === "startDate" ||
        item.accessorKey === "endDate"
      ) {
        value = new Date(value);
      }

      if (item.header === "Status") {
        newIsSaveDisabled = value.toString().length === 0;
      } else if (item.type === "BOOLEAN") {
        newIsSaveDisabled = value.toString() === "";
      } else if (item.type === "DECIMAL") {
        newIsSaveDisabled = Number(value) < 0.01;
      } else if (item.type === "NUMBER") {
        newIsSaveDisabled = Number(value) < 1;
      } else if (
        item.type === "DATE" ||
        item.accessorKey === "startDate" ||
        item.accessorKey === "endDate"
      ) {
        newIsSaveDisabled = !value;
      } else {
        newIsSaveDisabled = String(value).length < 2;
      }
    }

    setData((prevData) => ({
      ...prevData,
      [itemAccessor]: value,
    }));
    setIsEditing(true);
    setIsSaveDisabled(newIsSaveDisabled);
  };

  const handleSaveLead = (itemAccessor: string) => {
    setClickedToUpdateAccessor(null);

    let newValue = data[itemAccessor];
    const item = filteredLeadData.find(
      (item) => item.accessorKey === itemAccessor,
    );

    if (item?.type === "DATE" && typeof newValue === "string") {
      newValue = new Date(newValue);
    }

    const updatedFilteredLeadData = filteredLeadData.map((item) =>
      item.accessorKey === itemAccessor ? { ...item, value: newValue } : item,
    );

    // @ts-ignore
    setFilteredLeadData(updatedFilteredLeadData);
    setIsEditing(false);
    setIsInitialSaved(true);
  };

  const dataWithCustomFieldsData = filteredLeadData.reduce(
    (acc, item) => {
      if (customAccessors.includes(item.accessorKey)) {
        if (item.value !== null) {
          acc.customFields.push({
            fieldName: item.accessorKey,
            // @ts-ignore
            fieldValue: item.value,
          });
        }
      } else if (nativeAccessors.includes(item.accessorKey)) {
        // @ts-ignore
        acc[item.accessorKey] = item.value;
      }
      return acc;
    },
    { customFields: [] as CustomData[] },
  );

  const filteredData = Object.fromEntries(
    Object.entries(data).filter(([key, value]) => {
      return (
        value !== null &&
        !dataWithCustomFieldsData.customFields.find(
          (field: CustomData) => field.fieldName === key,
        )
      );
    }),
  );

  // Confirmation for Route change
  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      if (
        (isEditing && !isNavigationConfirmedRef.current) ||
        (isInitialSaved && !isNavigationConfirmedRef.current)
      ) {
        setShowConfirmationModal(true);
        setNewRoute(url);
        router.events.emit("routeChangeError");
        throw "Abort route change";
      }
    };

    const handleRouteChangeComplete = () => {
      setShowConfirmationModal(false);
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [isEditing, router, isInitialSaved]);

  const handleConfirm = (confirmed: boolean) => {
    if (confirmed) {
      setShowConfirmationModal(false);

      if (newRoute) {
        isNavigationConfirmedRef.current = true;
        void router.push(newRoute);
      }
    } else {
      setShowConfirmationModal(false);

      isNavigationConfirmedRef.current = false;
    }
  };

  const handleUpdateLead = () => {
    setIsInitialSaved(false);

    const dataWouldBeUpdated = {
      ...filteredData,
      ...dataWithCustomFieldsData,
    };

    const updatedData = Object.fromEntries(
      Object.entries(dataWouldBeUpdated).map(([key, value]) => {
        if (key === "startDate" || key === "endDate") {
          if (value !== null && typeof value !== "boolean") {
            // @ts-ignore
            return [key, new Date(value)];
          }
        }
        return [key, value];
      }),
    );

    // @ts-ignore
    updateLead(updatedData, {
      onSuccess: () => {
        handleConfirm(true);
        setIsInitialSaved(false);
        // @ts-ignore
        setLeadData(filteredLeadData);
        notifications.show({
          title: "Lead Updated Successfully",
          message: "Lead has been updated successfully 🚀",
          autoClose: 5000,
          color: "green",
        });
        handleConfirm(true);
        void router.push("/dashboard/leads/timeline");
      },
      onError: (error) => {
        notifications.show({
          title: "Failed to update lead.",
          message: `Error: ${error.message}`,
          autoClose: 5000,
          color: "red",
        });
      },
    });
  };

  return (
    <MainLayout>
      <Modal
        opened={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        size="sm"
        centered
        title="Confirmation"
      >
        <div className="pb-4">Are you sure you want to leave?</div>
        <Group position="right">
          <Button
            className="bg-gray-300 text-sm hover:bg-gray-400"
            onClick={() => handleConfirm(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-black text-sm"
            onClick={() => handleConfirm(true)}
          >
            Leave
          </Button>
        </Group>
      </Modal>
      <div className="w-full bg-white px-2">
        {/* <button
            className="float-right mt-3 rounded-md bg-[#1D7ED6] p-2 px-4 text-white"
            onClick={() => void sendEmail()}
          >
            Send Email
          </button> */}
        <div className="flex w-full flex-col gap-y-12 bg-white px-2">
          <div className="mx-auto grid w-full max-w-5xl  grid-cols-[.9fr,1fr]  gap-y-12 py-6 md:mx-28 md:grid-cols-2">
            {filteredLeadData.map((item, index) => (
              <React.Fragment key={index}>
                <>
                  <label className="text-black-1 font-bold">
                    {item.header}
                  </label>
                  {clickedToUpdateAccessor === item.accessorKey ? (
                    <div className="relative flex gap-2">
                      {item.header === "Status" ? (
                        <Select
                          className="w-full"
                          placeholder="Select Status"
                          data={[
                            { label: "Easy Start", value: "EASY_START" },
                            { label: "New Lead", value: "NEW_LEAD" },
                            {
                              label: "Qualified Lead",
                              value: "QUALIFIED_LEAD",
                            },
                            { label: "Opened", value: "OPENED" },
                            { label: "In Progress", value: "IN_PROGRESS" },
                            { label: "Emailed", value: "EMAILED" },
                            { label: "Called", value: "CALLED" },
                            { label: "SMS", value: "SMS" },
                            { label: "Unqualified", value: "UNQUALIFIED" },
                            {
                              label: "Attempt to Contact",
                              value: "ATTEMPTED_TO_CONTACT",
                            },
                            { label: "Connected", value: "CONNECTED" },
                            { label: "Bad Timing", value: "BAD_TIMING" },
                          ]}
                          value={data[item.accessorKey]?.toString() || ""}
                          onChange={(value) =>
                            handleTextInputChange(item.accessorKey, value, item)
                          }
                          error={
                            data[item.accessorKey]?.toString().length === 0
                              ? "Status is required"
                              : null
                          }
                        />
                      ) : item.type === "BOOLEAN" ? (
                        <Select
                          className="w-full"
                          placeholder="Select a Boolean"
                          data={[
                            { label: "True", value: "true" },
                            { label: "False", value: "false" },
                          ]}
                          value={data[item.accessorKey] as string}
                          onChange={(value) =>
                            handleTextInputChange(
                              item.accessorKey,
                              value || false,
                              item,
                            )
                          }
                          error={
                            data[item.accessorKey]?.toString() === ""
                              ? "Must be selected"
                              : null
                          }
                        />
                      ) : item.type === "DECIMAL" ? (
                        <NumberInput
                          className="w-full"
                          placeholder="Enter a decimal"
                          precision={2}
                          step={0.01}
                          value={data[item.accessorKey] as number}
                          onChange={(value) =>
                            handleTextInputChange(
                              item.accessorKey,
                              value || 0.0,
                              item,
                            )
                          }
                          error={
                            (data[item.accessorKey] as number) < 0.01
                              ? "Should be a valid decimal number"
                              : null
                          }
                        />
                      ) : item.type === "NUMBER" ? (
                        <NumberInput
                          className="w-full"
                          placeholder="Enter a number"
                          value={data[item.accessorKey] as number}
                          onChange={(value) =>
                            handleTextInputChange(
                              item.accessorKey,
                              value || 0,
                              item,
                            )
                          }
                          error={
                            (data[item.accessorKey] as number) < 1
                              ? "Should be a valid number & not zero"
                              : null
                          }
                        />
                      ) : item.type === "DATE" ||
                        item.accessorKey === "startDate" ||
                        item.accessorKey === "endDate" ? (
                        <DatePickerInput
                          className="w-full"
                          // @ts-ignore
                          value={new Date(data[item.accessorKey])}
                          onChange={(value) =>
                            handleTextInputChange(item.accessorKey, value, item)
                          }
                          placeholder="Select a Date"
                        />
                      ) : (
                        <TextInput
                          className="w-full"
                          placeholder="Enter Text"
                          autoFocus
                          value={data[item.accessorKey] as string}
                          onChange={(event) =>
                            handleTextInputChange(
                              item.accessorKey,
                              event.currentTarget.value,
                              item,
                            )
                          }
                          error={
                            String(data[item.accessorKey]).length < 2
                              ? "Not less than 2 characters"
                              : null
                          }
                        />
                      )}
                      <button
                        onClick={() => handleSaveLead(item.accessorKey)}
                        disabled={isSaveDisabled}
                        className="absolute -right-7 flex h-6 w-6 items-center justify-center pt-4"
                      >
                        <SaveIcon width={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <span className="text-black-1 font-normal">
                        {item.type === "BOOLEAN"
                          ? item.value
                            ? "True"
                            : "False"
                          : item.type === "DATE" ||
                            item.accessorKey === "startDate" ||
                            item.accessorKey === "endDate"
                          ? item.value instanceof Date
                            ? item.value.toUTCString()
                            : typeof item.value === "string" &&
                              !isNaN(Date.parse(item.value))
                            ? new Date(item.value).toUTCString()
                            : ""
                          : item.accessorKey === "status"
                          ? getStatusLabel(item.value as string)
                          : String(item.value)}
                      </span>
                      <button
                        onClick={() => handleEditLead(item.accessorKey)}
                        className="flex h-6 w-6 items-center justify-center"
                      >
                        <PencilIcon width={13} />
                      </button>
                    </div>
                  )}
                </>
              </React.Fragment>
            ))}
          </div>
          <div className="mb-12 flex max-w-5xl justify-center gap-5 md:mx-4 md:justify-end">
            <Button
              disabled={isEditing || !leadId}
              onClick={handleUpdateLead}
              className="w-32 bg-black shadow-[0px_3px_10px_rgba(48,157,244,0.3)] hover:bg-black"
            >
              Save
            </Button>
            <Button
              onClick={() => {
                setIsEditing(false);
                setClickedToUpdateAccessor(null);
                !isEditing && void router.back();
              }}
              className="w-32 border border-black text-black shadow-[0px_3px_10px_rgba(48,157,244,0.3)] hover:bg-black hover:text-white"
            >
              {isEditing ? "Cancel" : "Back"}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Update;
