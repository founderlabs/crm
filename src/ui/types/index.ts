export type Id = string | number;

export type ColumnContainer = {
  id?: Id;
  title?: string;
  value?: string;
  label?: string;
};

export type Task = {
  department: string;
  status: string | null;
  id: string;
  notes: string | null;
  projectTitle: string;
  priority: string;
  assigned_to: string | null;
  projectObjective: string | null;
  initials: string;
  comments: [];
};
export type TaskCRM = {
  id: string;
  displayName: string;
  notes: string;
};

// export type Task = {
//   id: Id;
//   status: Id;
//   content: string;
// };

export type ListItem = {
  department: string;
  status: string | null;
  id: string;
  notes: string | null;
  projectTitle: string;
  priority: string;
  assigned_to: string | null;
};

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

export interface CustomField {
  id: string;
  header: string;
  accessorKey: string;
  required: boolean;
  show: boolean;
  value: string;
  type: "DATE" | "DECIMAL" | "NUMBER" | "TEXT" | "BOOLEAN";
}

export interface StructureCustomField {
  id: string;
  accessorKey: string;
  required: boolean;
  show: boolean;
  value: string;
  type: "DATE" | "DECIMAL" | "NUMBER" | "TEXT" | "BOOLEAN";
}

export type CustomFieldDataFromAPI = {
  id: string;
  fieldName: string;
  fieldType: "DATE" | "DECIMAL" | "NUMBER" | "TEXT" | "BOOLEAN";
  fieldVisibility: boolean;
  required: boolean;
};

// Update
export type DataState = {
  leadId: string;
  crmListId: string;
  userId: string;
  displayName: string;
  [key: string]: string | number | boolean | Date | null;
};

export type LeadDataItem = {
  accessorKey: string;
  header: string;
  value: string | null;
  type: "DATE" | "DECIMAL" | "NUMBER" | "TEXT" | "BOOLEAN";
};

export type LeadsDataType = {
  accessorKey: string;
  header: string;
  value: Date | string | null;
  type: string | boolean | number | Date | null;
};

export interface NavBarType {
  icon: React.JSX.Element;
  link: string;
  activeIcon: React.JSX.Element;
  name: string;
  mainLink: string;
  dropdownMenu:
    | {
        name: string;
        link: string;
      }[]
    | null;
}
[];

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

export interface LeadData {
  header: string;
  accessorKey: keyof Lead;
  value: string | number | boolean | Date | null | undefined;
}

export interface Column {
  header: string;
  accessorKey: string;
  show: boolean;
  required: boolean;
}

// Types
export type CRMDataType = {
  id: number;
  variables: string;
  statusVariables: string;
};
