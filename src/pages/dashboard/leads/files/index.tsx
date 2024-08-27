/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";

// Layouts
import LeadsLayout from "~/ui/layout/lead-layout";
import MainLayout from "~/ui/layout/main-layout";

// Store & API
import { saveAs } from "file-saver";
import { useBreadcrumbStore, useLeadStore } from "~/store";
import { api } from "~/utils/api";

// Mantine
import { Button, Group, Modal, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";

// Icons
import {
  ArrowLeftCircleIcon,
  ArrowUpDown,
  DownloadIcon,
  FileIcon,
  FolderArchiveIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";

// @shadcn-ui
import { useDisclosure } from "@mantine/hooks";
import {
  type ColumnDef,
  type SortingState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTable } from "~/ui/components/data-table";
import { Checkbox } from "~/ui/shadcn/checkbox";
import { DataTablePagination } from "~/ui/shadcn/table-pagination";

// Types
export type CRMFileListDataType = {
  id: string;
  photo: string;
  fileName: string;
  themeId: string;
  fileType: string;
  fileSize: string;
  uploadedOn: string;
  uploadedBy: string;
};

export type CRMFileListData = {
  id: string;
  name: string;
  type: string;
  document: string;
};

const LeadFile = () => {
  const store = useBreadcrumbStore();
  const { leadId, crmListId } = useLeadStore();

  useEffect(() => {
    store.setBreadcrumbs([
      { link: "/dashboard/add-data", label: "Data" },
      { link: "/dashboard/leads", label: "CRM" },
      { link: "/dashboard/leads/file", label: "Files" },
    ]);
  }, []);

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [rowSelection, setRowSelection] = useState<Record<number, boolean>>({});
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleteOpened, { open: deleteOpen, close: deleteClose }] =
    useDisclosure(false);

  const { data: getFileData, refetch } =
    api.leadDocument.getAllDocument.useQuery({
      leadId: leadId,
    });

  const { mutate: deleteDocument } =
    api.leadDocument.deleteDocument.useMutation({
      onSuccess: () => {
        void refetch();
        notifications.show({
          title: "File Deleted Successfully",
          message: "File has been deleted successfully 🚀",
          autoClose: 5000,
          color: "green",
        });
        deleteClose();
      },
      onError: (error) => {
        notifications.show({
          title: "Failed to delete file.",
          message: `Error: ${error.message}`,
          autoClose: 5000,
          color: "red",
        });
      },
    });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleFileDownload = ({
    downloadUrl,
    fileType,
    fileName,
  }: {
    downloadUrl: string;
    fileType: string;
    fileName: string;
  }) => {
    if (downloadUrl && fileName) {
      if (fileType === "Image") {
        saveAs(downloadUrl, `${fileName}.png`);
      } else if (
        fileType === "ZIP" ||
        fileType === "TXT" ||
        fileType === "PDF"
      ) {
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `a.${
          fileType === "ZIP"
            ? "zip"
            : fileType === "TXT"
              ? "txt"
              : fileType === "PDF"
                ? "pdf"
                : ""
        }`;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
      } else {
        saveAs(downloadUrl, `${fileName}`);
      }
    } else {
      console.error("downloadUrl or fileName is not defined.");
    }
  };

  const data = useMemo(
    () =>
      getFileData?.map((file) => {
        const { id, document, name, type } = file;

        return {
          id,
          name,
          type:
            type === "png"
              ? "Image"
              : type === "pdf"
                ? "PDF"
                : type === "zip"
                  ? "ZIP"
                  : "",
          document,
        };
      }) ?? [],
    [getFileData],
  );

  const columns: ColumnDef<CRMFileListData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          className="border-gray-600"
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            const allIds = data.map((row) => row.id);
            setSelectedRowIds(table.getIsAllPageRowsSelected() ? [] : allIds);
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          className="border-gray-600 text-gray-600"
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
    {
      header: () => {
        return (
          <Button
            variant="ghost"
            className="mx-3 pl-0 uppercase text-gray-600 md:mx-0"
          >
            File
          </Button>
        );
      },
      accessorKey: "document",
      cell: ({ row }) => {
        const file = row.original;

        return file.type === "PDF" ? (
          <div className="h-28 w-28 text-gray-600">
            <FileIcon width={112} height={112} />
          </div>
        ) : file.type === "ZIP" ? (
          <div className="h-28 w-28 text-gray-600">
            <FolderArchiveIcon width={112} height={112} />
          </div>
        ) : (
          <img src={file.document} alt="" className="h-28 w-28 rounded-md" />
        );
      },
    },
    {
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="pl-0 uppercase text-gray-600"
          >
            File Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      accessorKey: "name",
    },
    {
      header: () => {
        return (
          <Button variant="ghost" className="pl-0 uppercase">
            File Type
          </Button>
        );
      },
      accessorKey: "type",
    },
    {
      id: "actions",
      header: () => {
        return (
          <Button variant="ghost" className="pl-0 uppercase">
            Actions
          </Button>
        );
      },
      enableHiding: false,
      cell: ({ row }) => {
        const file = row.original;

        return (
          <button
            className="px-3"
            onClick={() =>
              handleFileDownload({
                downloadUrl: file?.document || "",
                fileName: file?.name || "",
                fileType: file?.type || "",
              })
            }
          >
            <DownloadIcon />
          </button>
        );
      },
    },
  ];

  const filterData = (data: CRMFileListData[], query: string) => {
    if (!query) return data;

    query = query.toLowerCase();

    return data.filter((file) => {
      return (
        (typeof file.name === "string" &&
          file.name.toLowerCase().includes(query)) ||
        (typeof file.type === "string" &&
          file.type.toLowerCase().includes(query))
      );
    });
  };

  const filteredData = useMemo(() => {
    return filterData(data, searchQuery);
  }, [data, searchQuery]);

  const table = useReactTable({
    data: filteredData,
    columns: columns,
    enableRowSelection: true,
    state: {
      rowSelection,
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <MainLayout>
      <LeadsLayout leadsHeaderTitle="">
        <div className="flex h-full w-full flex-1 flex-col justify-between px-3">
          <div className="h-full w-full overflow-x-scroll">
            <h2 className="mx-auto flex items-center gap-2 pt-10 text-xl text-gray-600 underline md:mx-28 md:text-3xl">
              <ArrowLeftCircleIcon
                className="cursor-pointer"
                onClick={() => void router.push(crmListId)}
              />
              Shared
            </h2>

            <div className="mx-auto flex flex-col gap-1 py-6 md:mx-28 md:flex-row md:justify-between">
              <TextInput
                className="h-[34px] pt-0 md:pt-2"
                placeholder="Search event, date, brand"
                mb="md"
                icon={<SearchIcon size="1.2rem" />}
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <div className="flex items-center justify-between gap-2">
                <Button
                  className="h-[36px] border border-stone-200 bg-gray-600 text-sm capitalize text-white shadow-[0px_3px_10px_rgba(48,157,244,0.3)] hover:border-gray-600 hover:bg-stone-200 hover:text-gray-600"
                  onClick={() => void router.push("files/upload")}
                >
                  Add file
                </Button>
                <Modal
                  opened={deleteOpened}
                  onClose={deleteClose}
                  withCloseButton={false}
                  title="Are you sure?"
                  centered
                  closeOnEscape
                >
                  <div className="pb-4">
                    Do you really want to delete these records?
                  </div>
                  <Group position="right">
                    <Button
                      className="border border-gray-600 bg-white text-gray-600 hover:bg-white"
                      onClick={deleteClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-red-600 text-sm font-normal hover:bg-red-700"
                      onClick={() => {
                        deleteDocument({ id: selectedRowIds[0] ?? "" });
                      }}
                    >
                      Delete
                    </Button>
                  </Group>
                </Modal>
                <button onClick={deleteOpen}>
                  <Trash2Icon color="gray" />
                </button>
              </div>
            </div>
            <div className="max-h-full w-full max-w-sm overflow-x-scroll text-gray-600 md:max-w-none">
              <DataTable table={table} columns={columns} />
            </div>
          </div>
          <DataTablePagination table={table} />
        </div>
      </LeadsLayout>
    </MainLayout>
  );
};

export default LeadFile;
