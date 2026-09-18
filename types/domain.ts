export type ManifestStatus = "DRAFT" | "READY" | "IN_DELIVERY" | "HANDED_OVER" | "COMPLETED" | "CANCELLED";
export type AwbStatus = "ADDED" | "SCANNED" | "HANDED_OVER" | "CANCELLED";

export interface Seller {
  seller_id: string;
  seller_code: string;
  seller_name: string;
  pic_name: string;
  pic_phone: string;
  address: string;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
  updated_at: string;
}

export interface Sprinter {
  sprinter_id: string;
  employee_code: string;
  name: string;
  phone: string;
  drop_point: string;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
  updated_at: string;
}

export interface Manifest {
  manifest_id: string;
  manifest_number: string;
  manifest_date: string;
  shift: string;
  drop_point: string;
  sprinter_id: string;
  seller_id: string;
  seller_code: string;
  pic_name: string;
  pic_phone: string;
  total_awb: number;
  status: ManifestStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  handed_over_at?: string;
  received_by?: string;
  received_phone?: string;
  notes?: string;
  pdf_file_id?: string;
  pdf_url?: string;
}

export interface ManifestItem {
  item_id: string;
  manifest_id: string;
  sequence: number;
  awb: string;
  status: AwbStatus;
  scanned_at?: string;
  scanned_by?: string;
  created_at: string;
}

export interface ActivityLog {
  log_id: string;
  timestamp: string;
  user_id: string;
  action: string;
  manifest_id?: string;
  awb?: string;
  old_value?: string;
  new_value?: string;
  description: string;
  device?: string;
}

export const SHEET_HEADERS = {
  CONFIG: ["key", "value", "description"],
  SELLERS: ["seller_id", "seller_code", "seller_name", "pic_name", "pic_phone", "address", "status", "created_at", "updated_at"],
  SPRINTERS: ["sprinter_id", "employee_code", "name", "phone", "drop_point", "status", "created_at", "updated_at"],
  USERS: ["user_id", "name", "email", "role", "drop_point", "status", "created_at"],
  MANIFESTS: ["manifest_id", "manifest_number", "manifest_date", "shift", "drop_point", "sprinter_id", "seller_id", "seller_code", "pic_name", "pic_phone", "total_awb", "status", "created_by", "created_at", "updated_at", "handed_over_at", "received_by", "received_phone", "notes", "pdf_file_id", "pdf_url"],
  MANIFEST_ITEMS: ["item_id", "manifest_id", "sequence", "awb", "status", "scanned_at", "scanned_by", "created_at"],
  LOGS: ["log_id", "timestamp", "user_id", "action", "manifest_id", "awb", "old_value", "new_value", "description", "device"]
} as const;
