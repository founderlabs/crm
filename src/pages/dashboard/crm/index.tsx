import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";

// Layout
import MainLayout from "~/ui/layout/main-layout";

import { api } from "~/utils/api";
import { useBreadcrumbStore } from "~/store";

// Mantine
import { useDisclosure } from "@mantine/hooks";
import { Modal, Select, Text } from "@mantine/core";

const DataSettingsCRM = () => {
  const router = useRouter();
  const store = useBreadcrumbStore();
  const [opened, { close }] = useDisclosure(true);

  useEffect(() => {
    store.setBreadcrumbs([
      {
        label: "Data",
        link: "/dashboard/leads",
      },
      {
        label: "Leads",
        link: "/dashboard/leads",
      },
    ]);
  }, []);

  const { data: allCrmLists } = api.crmList.getAllCrmList.useQuery();

  const [allCRMData, setAllCRMData] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);

  const [selectedCRMId, setSelectedCRMId] = useState<string | null>(null);

  useEffect(() => {
    if (allCrmLists && allCrmLists?.length > 0) {
      const data = allCrmLists?.map((crmList) => ({
        label: crmList.name,
        value: crmList.id,
      }));
      setAllCRMData(data);
    }
  }, [allCrmLists]);

  useEffect(() => {
    if ((selectedCRMId !== null || selectedCRMId !== "") && selectedCRMId) {
      void router.push(`crm/${selectedCRMId}`);
    }
  }, [selectedCRMId]);

  return (
    <MainLayout>
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
                placeholder="Select a CRM List"
                value={selectedCRMId}
                onChange={(value) => setSelectedCRMId(value)}
              />
            </div>
          </div>
          <Modal opened={opened} onClose={close} centered>
            <div className="flex items-center justify-center pb-10 text-xl text-gray-600">
              Assuming you have already established a CRM List by acquiring a
              valid tier, you can now choose a CRM List for modifying the Lead
              structure!
            </div>
          </Modal>
        </div>
      </div>
    </MainLayout>
  );
};

export default DataSettingsCRM;
