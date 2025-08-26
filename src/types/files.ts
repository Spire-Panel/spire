export interface FileEntry {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  modified?: string;
  permissions?: string;
  mimeType?: string;
}

export interface FileContent {
  path: string;
  content: string;
  encoding: "utf8" | "base64";
  mimeType: string;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}
