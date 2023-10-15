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
