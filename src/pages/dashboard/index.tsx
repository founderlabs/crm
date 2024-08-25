import { useRouter } from "next/router";
import { useEffect, useState, type FormEvent } from "react";

import MainLayout from "~/ui/layout/main-layout";

import { Button, Group, Menu, Modal, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

import { MoreVertical } from "lucide-react";
import { useBreadcrumbStore, useCRMTogglerStore } from "~/store";
import { api } from "~/utils/api";

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
        link: "/dashboard",
      },
      {
        label: "CRM List",
        link: "/dashboard/leads",
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
      name: (value) =>
        value.startsWith(" ")
          ? "Name should not start with a space"
          : crmListId
          ? null
          : allCRMList?.some((crm) => crm.name === value)
          ? "Name already exists"
          : value.trim().length <= 2
          ? "Name is too short"
          : value.match(/^[^\W_]+/) === null
          ? "Name should not start with special characters"
          : null,
      description: (value) =>
        value.trim().length <= 5
          ? "Description is too short"
          : value.startsWith(" ")
          ? "Description should not start with a space"
          : null,
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
        <div className="w-full underline pb-10 text-center text-xl md:text-3xl font-medium text-gray-600">
          Customer Relationship Management
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
                className="bg-gray-600"
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
              className="flex h-[54px] w-full cursor-pointer items-center justify-between rounded border border-gray-600 p-2 md:w-[227px]"
            >
              <div></div>
              <button
                onClick={() => {
                  void router.push(`/dashboard/leads/${crmList.id}`);
                  setIsSubmitted(false);
                }}
                className="text-base font-thin text-stone-200 hover:"
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
                    className="border border-gray-600 bg-black  hover:bg-black"
                    onClick={deleteClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-gray-600"
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
            className="h-[54px] rounded border border-slate-500 bg-transparent hover:bg-gray-600 hover:text-black"
          >
            Add CRM List
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default CRMList;
