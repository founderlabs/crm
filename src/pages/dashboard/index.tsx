import React, { useState, type FormEvent, useEffect } from "react";
import { useRouter } from "next/router";

import MainLayout from "~/ui/layout/MainLayout";

import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Button, Group, Modal, TextInput, Menu } from "@mantine/core";

import { api } from "~/utils/api";
import { MoreVertical } from "lucide-react";
import { useBreadcrumbStore, useCRMTogglerStore } from "~/store";

type CRMListForm = {
  name: string;
  description: string;
};

const CRMList = () => {
  const router = useRouter();
  const store = useBreadcrumbStore();
  const { setIsSubmitted } = useCRMTogglerStore();
  const [crmListId, setCRMListId] = useState<string>("");
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteOpened, { open: deleteOpen, close: deleteClose }] =
    useDisclosure(false);

  useEffect(() => {
    store.setBreadcrumbs([
      {
        label: "Data",
        link: "/dashboard/data",
      },
      {
        label: "CRM List",
        link: "/dashboard/data/leads",
      },
    ]);
  }, []);

  const { data: allCRMList, refetch } = api.crmList.getAllCrmList.useQuery();

  const { mutate: deleteCrmList } = api.crmList.deleteCrmList.useMutation({
    onSuccess: () => {
      void refetch();
      notifications.show({
        title: "CRM List Deleted Successfully",
        message: "Awesome, you have successfully deleted the CRM list! 🚀",
        autoClose: 5000,
        color: "green",
      });
      deleteClose();
    },
    onError: (error) => {
      notifications.show({
        title: "Failed to delete CRM list, please try again later.",
        message: "Make sure the CRM will be empty before deleting!",
        autoClose: 5000,
        color: "red",
      });
      console.error("Error deleting CRM list:", error);
    },
  });

  const { mutate: addCrmList } = api.crmList.addCrmList.useMutation({
    onSuccess: () => {
      void refetch();
      notifications.show({
        title: "CRM List Added Successfully",
        message: "Awesome, you have successfully added the CRM list! 🚀",
        autoClose: 5000,
        color: "green",
      });
      form.reset();
    },
    onError: (error) => {
      notifications.show({
        title: "Failed to add CRM list, please try again later.",
        message: "",
        autoClose: 5000,
        color: "red",
      });
      console.error("Error adding CRM list:", error);
    },
  });

  const initialFormData = {
    name: "",
    description: "",
  };

  const form = useForm<CRMListForm>({
    initialValues: initialFormData,
    validateInputOnChange: true,
    validate: {
      name: (value) => {
        if (value.length <= 2) {
          return "too short";
        }
        if (value.length >= 12) {
          return "too long";
        }
        if (allCRMList?.some((crm) => crm.name === value)) {
          return "name already exists";
        }
        return null;
      },
      description: (value) => (value.length <= 5 ? "too short" : null),
    },
  });

  const handleFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    close();
    if (crmListId) {
      open();
      updateCRMList({
        crmListId: crmListId,
        updateData: { ...form.values },
      });
    } else {
      addCrmList({
        ...form.values,
      });
    }
  };

  const { mutate: singleCRMList } = api.crmList.getSingleCRMList.useMutation({
    onSuccess: (data) => {
      const crmList = data as {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
      };

      form.setValues({
        name: crmList.name,
        description: crmList.description,
      });
    },
  });

  useEffect(() => {
    singleCRMList({
      id: crmListId,
    });
  }, [crmListId]);

  const { mutate: updateCRMList } = api.crmList.updateCRMList.useMutation({
    onSuccess: () => {
      void refetch();
      notifications.show({
        title: "CRM List Updated Successfully",
        message: "Awesome, you have successfully updated the CRM list! 🚀",
        autoClose: 5000,
        color: "green",
      });
      close();
    },
    onError: (error) => {
      notifications.show({
        title: "Failed to update CRM list, please try again later.",
        message: "",
        autoClose: 5000,
        color: "red",
      });
      console.log("Error updating CRM List", error);
    },
  });

  return (
    <MainLayout>
      <>
        <div className="w-full pb-10 text-center text-3xl font-medium text-gray-600">
          CRM List
        </div>
        <Modal
          opened={opened}
          onClose={close}
          withCloseButton={false}
          title="Lead CRM List"
        >
          <form className="flex w-full flex-col gap-4">
            <TextInput
              {...form.getInputProps("name")}
              onChange={(event) => {
                form.setFieldValue("name", event.currentTarget.value);
              }}
              placeholder="Enter CRM Name"
              label="Name"
            />
            <TextInput
              {...form.getInputProps("description")}
              onChange={(event) => {
                form.setFieldValue("description", event.currentTarget.value);
              }}
              placeholder="Enter CRM Description"
              label="Description"
            />
            <Group>
              <Button
                className="bg-black"
                onClick={handleFormSubmit}
                disabled={!form.isValid()}
              >
                Submit
              </Button>
            </Group>
          </form>
        </Modal>
      </>
      <div className="flex w-full justify-center">
        <div className="flex w-full flex-col flex-wrap items-center justify-around gap-6 md:w-auto md:flex-row">
          {allCRMList?.map((crmList) => (
            <div
              key={crmList.id}
              className="flex h-[54px] w-full cursor-pointer items-center justify-between rounded border border-black p-2 md:w-[227px]"
            >
              <div></div>
              <button
                onClick={() => {
                  void router.push(`/dashboard/leads/${crmList.id}`);
                  setIsSubmitted(false);
                }}
                className="text-base font-semibold text-gray-600 hover:text-black"
              >
                {crmList.name}
              </button>
              <Modal
                opened={deleteOpened}
                onClose={deleteClose}
                withCloseButton={false}
                title="Are you sure?"
                centered
              >
                <div className="pb-4">
                  Do you really want to delete these records? It will delete all
                  the leads in this CRM List.
                </div>
                <Group>
                  <Button
                    className="border border-black bg-white text-black hover:bg-white"
                    onClick={deleteClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-black"
                    onClick={() => {
                      deleteCrmList({
                        id: crmList.id,
                      });
                    }}
                  >
                    Delete
                  </Button>
                </Group>
              </Modal>
              <Menu trigger="click" shadow="md" width={200}>
                <Menu.Target>
                  <MoreVertical />
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    onClick={() => {
                      open();
                      setCRMListId(crmList.id);
                    }}
                  >
                    Edit
                  </Menu.Item>
                  <Menu.Item onClick={deleteOpen}>Delete</Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>
          ))}
          <Button
            onClick={open}
            className="h-[54px] rounded border border-black bg-transparent text-black hover:bg-black hover:text-white"
          >
            Add CRM List
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default CRMList;
