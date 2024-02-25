/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { useRouter } from "next/router";
import React, { useState, useEffect, useMemo } from "react";

// Layouts
import MainLayout from "~/ui/layout/main-layout";
import LeadsLayout from "~/ui/layout/lead-layout";

// Store & API
import { api } from "~/utils/api";
import { saveAs } from "file-saver";
import { useBreadcrumbStore, useLeadStore } from "~/store";

// Mantine
import { notifications } from "@mantine/notifications";
import { TextInput, Button, Modal, Group } from "@mantine/core";

// Icons
import {
  ArrowUpDown,
  DownloadIcon,
  FileIcon,
  FolderArchiveIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";

// @shadcn-ui
import {
  type ColumnDef,
  type SortingState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Checkbox } from "~/ui/shadcn/checkbox";
import { DataTablePagination } from "~/ui/shadcn/table-pagination";
import { useDisclosure } from "@mantine/hooks";
import { DataTable } from "~/ui/components/data-table";

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
  const { leadId } = useLeadStore();

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
          className="border-black"
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
    {
      header: () => {
        return (
          <Button
            variant="ghost"
            className="text-black-1 mx-3 pl-0 uppercase md:mx-0"
          >
            File
          </Button>
        );
      },
      accessorKey: "document",
      cell: ({ row }) => {
        const file = row.original;

        return file.type === "PDF" ? (
          <div className="text-black-1 h-28 w-28">
            <FileIcon width={112} height={112} />
          </div>
        ) : file.type === "ZIP" ? (
          <div className="text-black-1 h-28 w-28">
            <FolderArchiveIcon width={112} height={112} />
          </div>
        ) : (
          <img src={file.document} alt="" className="h-28 w-28" />
        );
      },
    },
    {
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-black-1 pl-0 uppercase"
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
          <Button variant="ghost" className="text-black-1 pl-0 uppercase">
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
          <Button variant="ghost" className="text-black-1 pl-0 uppercase">
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
        <div className="h-full w-full px-3">
          <div className="flex flex-col gap-1 md:flex-row md:justify-between">
            <div className="">
              <TextInput
                className="h-[34px]"
                placeholder="Search event, date, brand"
                mb="md"
                icon={<SearchIcon size="1.2rem" className="text-black-1" />}
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button
                className="h-[36px] bg-black text-sm capitalize"
                onClick={() => void router.push("files/upload")}
              >
                upload file
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
                    className="border border-black bg-white text-black hover:bg-white"
                    onClick={deleteClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-black text-white"
                    onClick={() => {
                      deleteDocument({ id: selectedRowIds[0] ?? "" });
                    }}
                  >
                    Delete
                  </Button>
                </Group>
              </Modal>
              <button onClick={deleteOpen}>
                <Trash2Icon />
              </button>
            </div>
          </div>
          <div className="max-h-full w-full max-w-sm md:max-w-none">
            <DataTable table={table} columns={columns} />
          </div>
          <DataTablePagination table={table} />
        </div>
      </LeadsLayout>
    </MainLayout>
  );
};

export default LeadFile;
