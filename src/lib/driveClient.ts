const BASE = "https://www.googleapis.com/drive/v3";
const ROOT = process.env.NEXT_PUBLIC_DRIVE_ROOT_FOLDER_ID!;

async function get(path: string, token: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Drive API ${res.status}`);
  return res.json();
}

export async function listFacilityFolders(token: string) {
  const q = `'${ROOT}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const data = await get(
    `/files?q=${encodeURIComponent(q)}&fields=files(id,name,modifiedTime)&orderBy=name&pageSize=200`,
    token
  );
  return (data.files ?? []) as DriveFolder[];
}

export async function listFilesInFolder(token: string, folderId: string) {
  const q = `'${folderId}' in parents and trashed=false`;
  const data = await get(
    `/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,modifiedTime,webViewLink,iconLink)&orderBy=modifiedTime+desc&pageSize=100`,
    token
  );
  return (data.files ?? []) as DriveFile[];
}

export async function searchDrive(token: string, query: string) {
  const q = `fullText contains '${query.replace(/'/g, "\\'")}' and trashed=false`;
  const data = await get(
    `/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,modifiedTime,webViewLink,parents)&orderBy=modifiedTime+desc&pageSize=50`,
    token
  );
  return (data.files ?? []) as DriveFile[];
}

export interface DriveFolder {
  id: string;
  name: string;
  modifiedTime?: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
  parents?: string[];
}

export const MIME_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: string }
> = {
  "application/vnd.google-apps.document": {
    label: "Google Doc",
    bg: "bg-blue-50",
    text: "text-blue-700",
    icon: "📄",
  },
  "application/vnd.google-apps.presentation": {
    label: "スライド",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    icon: "📊",
  },
  "application/vnd.google-apps.spreadsheet": {
    label: "スプレッドシート",
    bg: "bg-green-50",
    text: "text-green-700",
    icon: "📈",
  },
  "application/pdf": {
    label: "PDF",
    bg: "bg-red-50",
    text: "text-red-700",
    icon: "📕",
  },
};
