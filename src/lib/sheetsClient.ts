const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";
const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID!;

async function getRange(token: string, range: string) {
  const res = await fetch(
    `${SHEETS_BASE}/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Sheets API ${res.status}`);
  const data = await res.json();
  return (data.values ?? []) as string[][];
}

export interface Measure {
  facility: string;
  name: string;
  category: string;
  startMonth: string; // YYYY/MM
  endMonth: string;   // YYYY/MM
  memo: string;
  docLink: string;
  evaluation: string;
}

export interface SalesRecord {
  facility: string;
  month: string;     // YYYY/MM
  revenue: number | null;
  occupancy: number | null;
  revpar: number | null;
  momRatio: number | null; // 前月比
  yoyRatio: number | null; // 前年比
  memo: string;
}

export async function fetchMeasures(token: string): Promise<Measure[]> {
  const rows = await getRange(token, "施策マスター!A2:H500");
  return rows
    .filter((r) => r[0] && r[1])
    .map((r) => ({
      facility: r[0] ?? "",
      name: r[1] ?? "",
      category: r[2] ?? "",
      startMonth: r[3] ?? "",
      endMonth: r[4] ?? "",
      memo: r[5] ?? "",
      docLink: r[6] ?? "",
      evaluation: r[7] ?? "未評価",
    }));
}

export async function fetchSales(token: string): Promise<SalesRecord[]> {
  const rows = await getRange(token, "売上データ!A2:H500");
  return rows
    .filter((r) => r[0] && r[1])
    .map((r) => ({
      facility: r[0] ?? "",
      month: r[1] ?? "",
      revenue: parseNum(r[2]),
      occupancy: parseNum(r[3]),
      revpar: parseNum(r[4]),
      momRatio: parseRatio(r[5]),
      yoyRatio: parseRatio(r[6]),
      memo: r[7] ?? "",
    }));
}

function parseNum(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number(v.replace(/[,，%％]/g, ""));
  return isNaN(n) ? null : n;
}

function parseRatio(v: string | undefined): number | null {
  if (!v) return null;
  const s = v.replace(/[%％]/g, "").replace(/^\+/, "");
  const n = Number(s);
  return isNaN(n) ? null : n;
}

export function getFacilities(measures: Measure[], sales: SalesRecord[]): string[] {
  const set = new Set([
    ...measures.map((m) => m.facility),
    ...sales.map((s) => s.facility),
  ]);
  return Array.from(set).sort();
}

export const CATEGORY_COLORS: Record<string, string> = {
  OTA: "#6366f1",
  広告: "#f59e0b",
  "イベント・プロモーション": "#10b981",
  その他: "#94a3b8",
};
