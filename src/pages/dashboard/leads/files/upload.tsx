import { useRouter } from "next/router";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import LeadsLayout from "~/ui/layout/lead-layout";
import MainLayout from "~/ui/layout/main-layout";

import axios from "axios";
import { useBreadcrumbStore, useLeadStore } from "~/store";
import { api } from "~/utils/api";

import { Button, Loader, Select, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

import { UploadIcon } from "lucide-react";

export default function Upload() {
  const router = useRouter();

  const { leadId } = useLeadStore();
  const { setBreadcrumbs } = useBreadcrumbStore();

  useEffect(() => {
    setBreadcrumbs([
      {
        label: "Data",
        link: "/dashboard/add-data",
      },
      {
        label: "Leads",
        link: "/dashboard/leads",
      },
    ]);

    (leadId === undefined || leadId === "" || leadId === null) &&
      void router.push("/dashboard/leads");
  }, []);

  type FormDataType = {
    name: string;
    fileType: string;
    file: string;
  };

  const initialFormData = {
    name: "",
    fileType: "",
    file: "",
  };

  const [fileUrl, setFileUrl] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  const form = useForm<FormDataType>({
    initialValues: initialFormData,
    validateInputOnChange: true,
    validate: {
      name: (value) => (value.length <= 2 ? "too short" : null),
      fileType: (value) => (value.length === 0 ? "must be selected" : null),
      file: (value) => (value.length === 0 ? "select one" : null),
    },
  });

  const { mutate: createDocument, isLoading } =
    api.leadDocument.addDocument.useMutation({
      onSuccess: () => {
        notifications.show({
          title: "File Uploaded Successfully",
          message: "File has been uploaded successfully 🚀",
          autoClose: 5000,
          color: "green",
        });
        form.setValues(initialFormData);
        void router.push("/dashboard/leads/files");
      },
      onError: (error) => {
        notifications.show({
          title: "Failed to upload file.",
          message: `Error: ${error.message}`,
          autoClose: 5000,
          color: "red",
        });
      },
    });

  const getFileExtension = (filename: string) => {
    return filename?.split(".").pop();
  };

  async function uploadToS3(e: ChangeEvent<HTMLInputElement>) {
    const fileInput = e.target;
    const file = fileInput.files?.[0];

    if (!file) {
      return null;
    }

    try {
      const response = await axios.post("/api/upload-file", {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
        },
        path: `${leadId}/${form.values.name}/${
          form.values.fileType === "PNG" ||
          form.values.fileType === "JPEG" ||
          form.values.fileType === "JPG"
            ? "images"
            : "files"
        }`,
        fileType: getFileExtension(file.name),
        fileName: `${form.values.name}-${Math.floor(Math.random() * 100000)}`,
      });

      const { data } = response;

      const res = await axios.put(data.preSignedUrl as string, file, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          mode: "no-cors",
        },
      });

      setFileUrl(res.config.url?.split("?")[0] as string);
    } catch (error) {
      console.error("Error getting presigned URL or uploading file:", error);
    }
  }

  async function handleFileSelection(e: ChangeEvent<HTMLInputElement>) {
    await uploadToS3(e);
  }

  console.log("fileUrl", fileUrl);

  const handleFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (
      form.values.name === "" &&
      form.values.fileType === "" &&
      fileUrl === ""
    ) {
      notifications.show({
        title: "Please fill all the required fields",
        message: "",
        color: "red",
      });
    } else {
      createDocument({
        name: form.values.name,
        type: form.values.fileType,
        document: fileUrl,
        leadId: leadId,
      });
    }
  };

  return (
    <MainLayout>
      <LeadsLayout>
        {isLoading ? (
          <div className="flex h-full w-full flex-1 items-center justify-center">
            <Loader />
          </div>
        ) : (
          <form className="flex h-full w-full flex-1 flex-col items-center justify-center gap-4 px-2 py-3 md:px-32 md:py-10">
            <div className="flex w-full justify-between">
              <label className="text-gray-600 w-1/3 text-base font-semibold">
                File Name
              </label>
              <TextInput
                className="w-2/3"
                {...form.getInputProps("name")}
                onChange={(event) => {
                  form.setFieldValue("name", event.currentTarget.value);
                }}
              />
            </div>
            <div className="flex w-full justify-between">
              <label className="text-gray-600 w-1/3 text-base font-semibold">
                File Type
              </label>
              <Select
                className="w-2/3"
                data={[
                  { label: "PDF", value: "pdf" },
                  { label: "Images", value: "png" },
                  { label: "ZIP", value: "zip" },
                ]}
                {...form.getInputProps("fileType")}
                onChange={(value) => {
                  form.setFieldValue("fileType", value!);
                }}
                disabled={form.values.name ? false : true}
              />
            </div>
            <div className="flex w-full justify-between">
              <label className="text-gray-600 w-1/3 text-base font-semibold">
                Upload File
              </label>
              <label className="relative block w-2/3 cursor-pointer rounded-sm border border-gray-200 bg-white text-sm">
                <input
                  className="h-[34px] w-full rounded-sm text-white opacity-0"
                  name="file"
                  type="file"
                  accept={
                    form.values.fileType === "png"
                      ? "image/*"
                      : form.values.fileType === "pdf"
                      ? "application/pdf"
                      : form.values.fileType === "zip"
                      ? "application/zip"
                      : ""
                  }
                  onChange={(e) => {
                    void handleFileSelection(e);
                    setFileName(
                      e.target.files ? (e.target.files[0]?.name as string) : "",
                    );
                  }}
                  disabled={form.values.fileType.length === 0}
                />
                <p className="font-poppins absolute left-3 top-2 ">
                  {fileName.length > 1 ? (
                    fileName
                  ) : (
                    <p className="text-gray-400">
                      {form.values.fileType === "images"
                        ? "Single file (recommended: PNG format)"
                        : "Only single file can be uploaded"}
                    </p>
                  )}
                </p>
                <p className="font-poppins absolute right-3 top-2.5 ">
                  <UploadIcon width={14} height={17} />
                </p>
              </label>
            </div>
            <div className="flex w-full justify-end gap-3">
              <Button
                disabled={fileUrl === ""}
                className="h-[34px] w-32 border border-stone-200 bg-gray-600 text-white shadow-[0px_3px_10px_rgba(48,157,244,0.3)] hover:bg-stone-200 hover:text-gray-600 hover:border-gray-600"
                onClick={handleFormSubmit}
              >
                Send
              </Button>
              <Button
                className="h-[34px] w-32 border-gray-600 bg-transparent text-gray-600 hover:bg-white"
                onClick={() => {
                  form.reset();
                  void router.push("/dashboard/leads/files");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </LeadsLayout>
    </MainLayout>
  );
}
