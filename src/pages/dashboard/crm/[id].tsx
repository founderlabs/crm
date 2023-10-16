import { useRouter } from "next/router";
import React, { useState, useEffect, useRef } from "react";

// Layouts
// import MainLayout from "@/ui/layout/main-layout";
// import SettingsLayout from "@/ui/layout/settings-layout";

import { api } from "~/utils/api";
import { useBreadcrumbStore, useCRMTogglerStore } from "~/store";

// Mantine
import { notifications } from "@mantine/notifications";
import {
  Modal,
  Button,
  TextInput,
  Switch,
  Select,
  Group,
  Text,
} from "@mantine/core";
import { DeleteIcon, PencilIcon } from "lucide-react";

export interface Column {
  header: string;
  accessorKey: string;
  show: boolean;
  required: boolean;
}

export type CustomData = {
  fieldName: string;
  fieldValue: string[] | string | number | boolean | Date;
  type?: string;
};

export type Data = Record<string, string | number | boolean | Date>;

interface CustomField {
  id: string;
  accessorKey: string;
  required: boolean;
  show: boolean;
  value: string;
  type: "DATE" | "DECIMAL" | "NUMBER" | "TEXT" | "BOOLEAN";
}

// Types
export type CRMDataType = {
  id: number;
  variables: string;
  statusVariables: string;
};

const DataSettingsCRM = () => {
  const router = useRouter();
  const store = useBreadcrumbStore();
  const crmListId = router.query.id as string;
  const { setIsSubmitted } = useCRMTogglerStore();

  const [selectedCRMId, setSelectedCRMId] = useState<string | null>(null);

  useEffect(() => {
    if ((selectedCRMId !== null || selectedCRMId !== "") && selectedCRMId) {
      void router.push(`${selectedCRMId}`);
    }
    setSelectedCRMId(crmListId);
  }, [crmListId]);

  useEffect(() => {
    store.setBreadcrumbs([{ link: "/dashboard/settings", label: "Settings" }]);
  }, []);

  const [columns, setColumns] = useState<Column[]>([
    {
      header: "First Name",
      accessorKey: "firstName",
      show: false,
      required: false,
    },
    {
      header: "Last Name",
      accessorKey: "lastName",
      show: false,
      required: false,
    },
    {
      header: "Company",
      accessorKey: "company",
      show: false,
      required: false,
    },
    {
      header: "Display Name",
      accessorKey: "displayName",
      show: true,
      required: true,
    },
    {
      header: "Email",
      accessorKey: "email",
      show: false,
      required: false,
    },
    {
      header: "Website",
      accessorKey: "website",
      show: false,
      required: false,
    },
    {
      header: "Phone",
      accessorKey: "mainPhone",
      show: false,
      required: false,
    },
    {
      header: "Mobile Phone",
      accessorKey: "mobilePhone",
      show: false,
      required: false,
    },
    {
      header: "Office Phone",
      accessorKey: "workPhone",
      show: false,
      required: false,
    },
    {
      header: "Fax",
      accessorKey: "faxNumber",
      show: false,
      required: false,
    },
    {
      header: "Address Line 1",
      accessorKey: "addressLine1",
      show: false,
      required: false,
    },
    {
      header: "Address Line 2",
      accessorKey: "addressLine2",
      show: false,
      required: false,
    },
    {
      header: "Postal Code",
      accessorKey: "postalCode",
      show: false,
      required: false,
    },
    {
      header: "City",
      accessorKey: "city",
      show: false,
      required: false,
    },
    {
      header: "State",
      accessorKey: "state",
      show: false,
      required: false,
    },
    {
      header: "Start Date",
      accessorKey: "startDate",
      show: false,
      required: false,
    },
    {
      header: "End Date",
      accessorKey: "endDate",
      show: false,
      required: false,
    },
  ]);

  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.filter((col: Column) => col.show).map((col) => col.accessorKey),
  );
  const [requiredColumns, setRequiredColumns] = useState<string[]>(
    columns.filter((col: Column) => col.required).map((col) => col.accessorKey),
  );
  const [customField, setCustomField] = useState<CustomField[]>([]);
  const [visibleCustomColumns, setVisibleCustomColumns] = useState<string[]>(
    customField
      .filter((col: CustomField) => col.show)
      .map((col) => col.accessorKey),
  );
  const [requiredCustomColumns, setRequiredCustomColumns] = useState<string[]>(
    customField
      .filter((col: CustomField) => col.required)
      .map((col) => col.accessorKey),
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [customFieldName, setCustomFieldName] = useState<string>("");
  const [required, setRequired] = useState<boolean>(true);
  const [customFieldType, setCustomFieldType] = useState<
    "DATE" | "DECIMAL" | "NUMBER" | "TEXT" | "BOOLEAN"
  >("TEXT");
  const [colIdToUpdate, setColIdToUpdate] = useState<string>("");
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [newRoute, setNewRoute] = useState<string | null>(null);
  const isNavigationConfirmedRef = useRef<boolean>(false);
  const [isDrafted, setIsDrafted] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const { data: allCrmLists } = api.crmList.getAllCrmList.useQuery();

  const [allCRMData, setAllCRMData] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);

  useEffect(() => {
    if (allCrmLists && allCrmLists?.length > 0) {
      const data = allCrmLists?.map((crmList) => ({
        label: crmList.name,
        value: crmList.id,
      }));
      setAllCRMData(data);
    }
  }, [allCrmLists]);

  const { data: getLeadStructure, refetch } =
    api.leadFieldStructure.getLeadStructure.useQuery({
      crmListId: selectedCRMId as string,
    });

  const { mutate: addLeadFieldStructure } =
    api.leadFieldStructure.addLeadFieldStructure.useMutation({
      onSuccess: () => {
        setIsSaved(true);
        handleConfirm(true);
        setIsSubmitted(true);
        notifications.show({
          title: "Submitted successfully!",
          message: "",
          color: "green",
        });
        void router.push(`/dashboard/leads/${crmListId}`);
      },
      onError: (error) => {
        notifications.show({
          title: "Failed to create Leads CRM, please try again!",
          message: `Error: ${error.message}`,
          color: "red",
        });
        console.log("error adding leads structure", error);
      },
    });

  const { mutate: updateLeadStructure } =
    api.leadFieldStructure.updateLeadStructure.useMutation({
      onSuccess: () => {
        setIsSaved(true);
        handleConfirm(true);
        setIsSubmitted(true);
        notifications.show({
          title: "Updated successfully!",
          message: "",
          color: "green",
        });
        void router.push(`/dashboard/leads/${crmListId}`);
      },
      onError: (error) => {
        notifications.show({
          title: "Failed to update Leads CRM, please try again!",
          message: `Error: ${error.message}`,
          color: "red",
        });
        console.log("error updating leads structure", error);
      },
    });

  const { mutate: deleteCustomField } =
    api.leadFieldStructure.deleteCustomField.useMutation({
      onSuccess: (_, variables) => {
        const customFieldId = variables.customFieldId;
        setCustomField((prevCustomFields) =>
          prevCustomFields.filter((field) => field.id !== customFieldId),
        );
        setVisibleCustomColumns((prevVisibleColumns) =>
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

  type CustomFieldDataFromAPI = {
    id: string;
    fieldName: string;
    fieldType: "DATE" | "DECIMAL" | "NUMBER" | "TEXT" | "BOOLEAN";
    fieldVisibility: boolean;
    required: boolean;
  };

  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      if (isDrafted && !isNavigationConfirmedRef.current) {
        if (!isSaved) {
          setShowConfirmationModal(true);
          setNewRoute(url);
          router.events.emit("routeChangeError");
          throw "Abort route change";
        }
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
  }, [isDrafted, router, isSaved]);

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

  useEffect(() => {
    if (getLeadStructure) {
      const updatedCustomFields = getLeadStructure.customFields.map(
        (customField: CustomFieldDataFromAPI) => ({
          id: customField.id,
          accessorKey: customField.fieldName,
          show: customField.fieldVisibility,
          required: customField.required,
          type: customField.fieldType,
          value: "",
        }),
      );
      setCustomField(updatedCustomFields);

      const updatedVisibleCustomColumns = updatedCustomFields
        .filter((col) => col.show)
        .map((col) => col.accessorKey);
      setVisibleCustomColumns(updatedVisibleCustomColumns);

      const updatedRequiredCustomColumns = updatedCustomFields
        .filter((col) => col.required)
        .map((col) => col.accessorKey);
      setRequiredCustomColumns(updatedRequiredCustomColumns);
    } else {
      setVisibleCustomColumns([]);
      setRequiredCustomColumns([]);
    }
  }, [getLeadStructure, deleteCustomField]);

  useEffect(() => {
    if (getLeadStructure) {
      const updatedColumns = columns.map((col: Column) => ({
        ...col,
        // @ts-ignore
        show: getLeadStructure[col.accessorKey] as boolean,
        [`${col.accessorKey}Required`]:
          getLeadStructure[
            `${col.accessorKey}Required` as keyof typeof getLeadStructure
          ] || false,
      }));
      setColumns(updatedColumns);

      const updatedVisibleColumns = updatedColumns
        .filter((col) => col.show)
        .map((col) => col.accessorKey);
      setVisibleColumns(updatedVisibleColumns);

      const updatedRequiredColumns = updatedColumns
        .filter(
          (col) =>
            getLeadStructure[
              `${col.accessorKey}Required` as keyof typeof getLeadStructure
            ],
        )
        .map((col) => col.accessorKey);
      setRequiredColumns(updatedRequiredColumns);
    } else {
      setVisibleColumns(["displayName"]);
      setRequiredColumns(["displayName"]);
    }
  }, [getLeadStructure]);

  useEffect(() => {
    setCustomField(customField);
  }, [customField]);

  const { mutate: updateCustomField } =
    api.leadFieldStructure.updateCustomFields.useMutation({
      onSuccess: () => {
        void refetch();
        setColIdToUpdate("");
        notifications.show({
          title: "Custom Field Updated Successfully",
          message: "Awesome, you have successfully updated the custom field 🚀",
          autoClose: 5000,
          color: "green",
        });
      },
      onError: (error) => {
        console.error("Error deleting custom field:", error);
        notifications.show({
          title: "Failed to update custom field",
          message: `Error: ${error.message}`,
          autoClose: 5000,
          color: "red",
        });
      },
    });

  const handleCustomFieldSave = () => {
    if (customFieldName.trim() !== "") {
      if (colIdToUpdate !== "") {
        updateCustomField({
          customFieldId: colIdToUpdate,
          customFieldData: {
            fieldType: customFieldType,
            fieldVisibility: true,
            required: required,
          },
        });
      } else {
        const newCustomField: CustomField = {
          id: "",
          accessorKey: customFieldName,
          required,
          show: true,
          type: customFieldType,
          value: "",
        };

        setCustomField((prevCustomFields) => [
          ...prevCustomFields,
          newCustomField,
        ]);
      }

      setRequiredCustomColumns(
        required
          ? [...requiredCustomColumns, customFieldName]
          : requiredCustomColumns,
      );

      setVisibleCustomColumns([...visibleCustomColumns, customFieldName]);
    }

    setRequired(true);
    setIsDrafted(true);
    setShowModal(false);
    setCustomFieldName("");
  };

  const handleColumnToggle = (columnId: string) => {
    setIsDrafted(true);

    const isCustomField = customField.some(
      (field) => field.accessorKey === columnId,
    );

    if (isCustomField) {
      setCustomField((prevCustomFields) =>
        prevCustomFields.map((field) => {
          return field.accessorKey === columnId
            ? { ...field, show: !field.show }
            : field;
        }),
      );

      setVisibleCustomColumns((prevVisibleCustomColumns) =>
        prevVisibleCustomColumns.includes(columnId)
          ? prevVisibleCustomColumns.filter((col) => col !== columnId)
          : [...prevVisibleCustomColumns, columnId],
      );

      setRequiredCustomColumns((prevRequiredCustomColumns) =>
        prevRequiredCustomColumns.includes(columnId)
          ? prevRequiredCustomColumns.filter((col) => col !== columnId)
          : prevRequiredCustomColumns,
      );
    } else {
      setColumns((prevColumns) =>
        prevColumns.map((col) =>
          col.accessorKey === columnId ? { ...col, show: !col.show } : col,
        ),
      );

      setVisibleColumns((prevVisibleColumns) =>
        prevVisibleColumns.includes(columnId)
          ? prevVisibleColumns.filter((col) => col !== columnId)
          : [...prevVisibleColumns, columnId],
      );

      setRequiredColumns((prevRequiredColumns) =>
        prevRequiredColumns.includes(columnId)
          ? prevRequiredColumns.filter((col) => col !== columnId)
          : prevRequiredColumns,
      );
    }
  };

  const handleRequiredToggle = (columnId: string) => {
    setIsDrafted(true);

    const isCustomField = customField.some(
      (field) => field.accessorKey === columnId,
    );

    if (isCustomField) {
      setCustomField((prevCustomFields) =>
        prevCustomFields.map((field) =>
          field.accessorKey === columnId
            ? { ...field, required: !field.required }
            : field,
        ),
      );

      setRequiredCustomColumns((prevRequiredCustomColumns) =>
        prevRequiredCustomColumns.includes(columnId)
          ? prevRequiredCustomColumns.filter((col) => col !== columnId)
          : [...prevRequiredCustomColumns, columnId],
      );
    } else {
      setColumns((prevColumns) =>
        prevColumns.map((col) =>
          col.accessorKey === columnId
            ? { ...col, required: !col.required }
            : col,
        ),
      );

      setRequiredColumns((prevRequiredColumns) =>
        prevRequiredColumns.includes(columnId)
          ? prevRequiredColumns.filter((col) => col !== columnId)
          : [...prevRequiredColumns, columnId],
      );
    }
  };

  const columnsData: Record<string, boolean> = columns.reduce((acc, col) => {
    const accessorKeyRequired: boolean =
      `${col.accessorKey}Required` as keyof typeof getLeadStructure;
    // @ts-ignore
    acc[col.accessorKey] = visibleColumns.includes(col.accessorKey);
    // @ts-ignore
    acc[accessorKeyRequired] = requiredColumns.includes(col.accessorKey);
    requiredColumns.includes(col.accessorKey);
    return acc;
  }, {});

  const handleSaveStructure = () => {
    const customFieldsData: {
      fieldName: string;
      fieldType: "DATE" | "DECIMAL" | "NUMBER" | "TEXT" | "BOOLEAN";
      required: boolean;
      fieldVisibility: boolean;
    }[] = customField.map((field) => ({
      fieldName: field.accessorKey,
      fieldType: field.type,
      required: field.required,
      fieldVisibility: field.show,
    }));

    const dataToSave: {
      customFields: {
        fieldName: string;
        fieldType: "DATE" | "DECIMAL" | "NUMBER" | "TEXT" | "BOOLEAN";
        required: boolean;
        fieldVisibility: boolean;
      }[];
      crmListId: string | null;
    } = {
      ...columnsData,
      customFields: customFieldsData,
      crmListId: selectedCRMId,
    };

    getLeadStructure || colIdToUpdate
      ? // @ts-ignore
        updateLeadStructure(dataToSave)
      : // @ts-ignore
        addLeadFieldStructure(dataToSave);
  };

  console.log("colIdToUpdate", colIdToUpdate);

  return (
    // <MainLayout>
    //   <SettingsLayout
    //     settingsHeaderTitle1="Form Structure"
    //     shouldRenderDiv={false}
    //   >
    <>
      <Modal
        opened={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        size="sm"
        centered
        title="Confirmation"
      >
        <div className="pb-4">Are you sure you want to leave?</div>
        <Group>
          <Button
            className="bg-gray-300 text-sm font-normal hover:bg-gray-400"
            onClick={() => handleConfirm(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-black text-sm font-normal"
            onClick={() => handleConfirm(true)}
          >
            Leave
          </Button>
        </Group>
      </Modal>
      <div className="h-full w-full md:px-20">
        <div className="flex flex-col gap-8 bg-white py-4">
          <div className="flex flex-col gap-4">
            <div className="flex w-full items-center justify-around">
              <Text className="w-28 text-base font-bold text-gray-600">
                CRM Name
              </Text>
              <Select
                allowDeselect
                data={allCRMData}
                className="w-1/2"
                value={selectedCRMId}
                onChange={(value) => setSelectedCRMId(value)}
              />
            </div>
            {/* <div className="flex w-full items-center justify-around">
                <Text className="w-28 text-base font-bold text-gray-600">
                  Data Source
                </Text>
                <Select
                  data={[
                    { label: "Form", value: "form" },
                    { label: "Survey", value: "survey" },
                    { label: "Pop-Up", value: "pop-up" },
                  ]}
                  placeholder="(Optional)"
                  className="w-1/2"
                />
              </div> */}
          </div>
          <div className="flex flex-col justify-center divide-y">
            <div className="flex w-full items-center justify-around">
              <Text className="w-28 py-6 text-center text-base font-bold text-gray-600">
                Variables
              </Text>
              <Text className="font-bold text-gray-600">Field Visibility</Text>
              <Text className="font-bold text-gray-600">Required</Text>
            </div>
            {columns.map((col) => (
              <div
                className="flex items-center justify-around py-6"
                key={col.accessorKey}
              >
                <span className="w-28">{col.header}</span>
                <Switch
                  checked={visibleColumns.includes(col.accessorKey)}
                  onChange={() => handleColumnToggle(col.accessorKey)}
                />
                <Switch
                  disabled={!visibleColumns.includes(col.accessorKey)}
                  checked={requiredColumns.includes(col.accessorKey)}
                  onChange={() => handleRequiredToggle(col.accessorKey)}
                />
              </div>
            ))}
            {customField.map((col) => (
              <div
                className="flex items-center justify-around py-6"
                key={col.accessorKey}
              >
                <span className="relative w-28">
                  {col.accessorKey}
                  <div className="absolute flex gap-2 md:hidden">
                    <button
                      onClick={(event) => {
                        event.preventDefault();
                        setShowModal(true);
                        setCustomFieldName(col.accessorKey);
                        setCustomFieldType(col.type);
                        setRequired(col.required);
                        setColIdToUpdate(col.id);
                      }}
                    >
                      <PencilIcon width={13} height={13} />
                    </button>
                    <button
                      onClick={() => {
                        setIsDrafted(true);
                        deleteCustomField({ customFieldId: col.id });
                        setCustomField(
                          customField.filter(
                            (field) => field.accessorKey !== col.accessorKey,
                          ),
                        );
                      }}
                    >
                      <DeleteIcon width={13} height={13} />
                    </button>
                  </div>
                </span>
                <Switch
                  checked={visibleCustomColumns.includes(col.accessorKey)}
                  onChange={() => handleColumnToggle(col.accessorKey)}
                />
                <Switch
                  disabled={!visibleCustomColumns.includes(col.accessorKey)}
                  checked={requiredCustomColumns.includes(col.accessorKey)}
                  onChange={() => handleRequiredToggle(col.accessorKey)}
                />
                <div className="absolute hidden md:right-32 md:flex md:gap-2">
                  <button
                    onClick={(event) => {
                      event.preventDefault();
                      setShowModal(true);
                      setCustomFieldName(col.accessorKey);
                      setCustomFieldType(col.type);
                      setRequired(col.required);
                      setColIdToUpdate(col.id);
                    }}
                  >
                    <PencilIcon width={13} height={13} />
                  </button>
                  {/* {col.show && ( */}
                  <button
                    onClick={() => {
                      deleteCustomField({ customFieldId: col.id });
                      setCustomField(
                        customField.filter(
                          (field) => field.accessorKey !== col.accessorKey,
                        ),
                      );
                    }}
                  >
                    <DeleteIcon width={13} height={13} />
                  </button>
                  {/* )} */}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <Button
              className="border border-black bg-white text-black hover:bg-black hover:text-white"
              onClick={() => {
                setColIdToUpdate("");
                setShowModal(true);
                setCustomFieldName("");
                setCustomFieldType("TEXT");
                setRequired(true);
              }}
            >
              Add Custom
            </Button>
            <Button
              className="bg-black text-white"
              onClick={() => {
                handleSaveStructure();
                setIsSaved(true);
              }}
            >
              Save
            </Button>
          </div>
          {showModal && (
            <Modal
              title={`${colIdToUpdate ? "Update" : "Add"} Custom Field`}
              opened={showModal}
              onClose={() => setShowModal(false)}
              centered
            >
              <Modal.Body className="flex flex-col gap-4">
                <TextInput
                  disabled={colIdToUpdate !== "" ? true : false}
                  label="Custom Field Name"
                  value={customFieldName}
                  error={
                    colIdToUpdate === "" &&
                    customFieldName.length !== 0 &&
                    customField.some(
                      (field) => field.accessorKey === customFieldName,
                    )
                      ? "Field name is already exists!"
                      : null
                  }
                  onChange={(event) =>
                    setCustomFieldName(event.currentTarget.value)
                  }
                  placeholder="Enter field name"
                  required
                />
                <Select
                  label="Custom Field Type"
                  value={customFieldType}
                  searchable
                  clearable
                  onChange={(
                    value: "DATE" | "DECIMAL" | "NUMBER" | "TEXT" | "BOOLEAN",
                  ) => setCustomFieldType(value)}
                  data={[
                    { label: "Text", value: "TEXT" },
                    { label: "Number", value: "NUMBER" },
                    { label: "Decimal", value: "DECIMAL" },
                    { label: "Date", value: "DATE" },
                    { label: "Boolean", value: "BOOLEAN" },
                  ]}
                  placeholder="Enter field type"
                  required
                />
                <Switch
                  label="Required"
                  checked={required}
                  onChange={() => setRequired((prev) => !prev)}
                />
              </Modal.Body>
              <div className="flex justify-end gap-4">
                <Button
                  className="border border-black bg-white text-black hover:bg-black hover:text-white"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  disabled={
                    colIdToUpdate === "" && customFieldName.trim() === ""
                  }
                  className="bg-black text-white"
                  onClick={handleCustomFieldSave}
                >
                  Save
                </Button>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </>
  );
};

export default DataSettingsCRM;
