import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Breadcrumb {
  link: string;
  label: string;
}

interface BreadcrumbStore {
  breadcrumbs: Breadcrumb[];
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
}

export const useBreadcrumbStore = create<BreadcrumbStore>((set) => ({
  breadcrumbs: [],
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
}));

type CRMTogglerType = {
  isSubmitted: boolean;
  setIsSubmitted: (value: boolean) => void;
};

export const useCRMTogglerStore = create(
  persist<CRMTogglerType>(
    (set) => ({
      isSubmitted: true,
      setIsSubmitted: (value) => set({ isSubmitted: value }),
    }),
    {
      name: "xamtac-saas-crm-toggler",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export interface LeadData {
  header: string;
  accessorKey: string;
  value: string | null;
  type: "DATE" | "DECIMAL" | "NUMBER" | "TEXT" | "BOOLEAN";
}

interface LeadStore {
  leadId: string;
  setLeadId: (id: string) => void;
  crmListId: string;
  setCRMListId: (id: string) => void;
  leadData: LeadData[];
  setLeadData: (data: LeadData[]) => void;
}

export const useLeadStore = create(
  persist<LeadStore>(
    (set) => ({
      leadId: "",
      setLeadId: (id) => set({ leadId: id }),
      crmListId: "",
      setCRMListId: (id) => set({ crmListId: id }),
      leadData: [],
      setLeadData: (data) => set({ leadData: data }),
    }),
    {
      name: "xamtac-saas-lead-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
