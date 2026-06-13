"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import Navigation from "@/components/Navigation";
import {
  fetchMeasures,
  fetchSales,
  getFacilities,
  CATEGORY_COLORS,
  type Measure,
  type SalesRecord,
} from "@/lib/sheetsClient";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

function monthToDate(ym: string): Date {
  const [y, m] = ym.split("/").map(Number);
  return new Date(y, (m || 1) - 1, 1);
}

function monthsBetween(start: string, end: string): string[] {
  const months: string[] = [];
  const cur = monthToDate(start);
  const last = monthToDate(end);
  while (cur <= last) {
    months.push(`${cur.getFullYear()}/${String(cur.getMonth() + 1).padStart(2, "0")}`);
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

export default function TimelinePage() {
  const { accessToken, ready } = useGoogleAuth();
  const router = useRouter();
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!accessToken) { router.push("/"); return; }
    Promise.all([fetchMeasures(accessToken), fetchSales(accessToken)])
      .then(([m, s]) => {
        setMeasures(m);
        setSales(s);
        if (m.length > 0) setSelectedFacility(m[0].facility);
        else if (s.length > 0) setSelectedFacility(s[0].facility);
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [accessToken, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const facilities = useMemo(() => getFacilities(measures, sales), [measures, sales]);

  const facilityMeasures = useMemo(
    () => measures.filter((m) => m.facility === selectedFacility),
    [measures, selectedFacility]
  );

  const facilitySales = useMemo(
    () => sales.filter((s) => s.facility === selectedFacility).sort((a, b) => a.month.localeCompare(b.month)),
    [sales, selectedFacility]
  );

  // 全施策の期間から月軸を生成
  const allMonths = useMemo(() => {
    const allM = [
      ...facilityMeasures.map((m) => m.startMonth),
      ...facilityMeasures.map((m) => m.endMonth),
      ...facilitySales.map((s) => s.month),
    ].filter(Boolean).sort();
    if (allM.length === 0) return [];
    return monthsBetween(allM[0], allM[allM.length - 1]);
  }, [facilityMeasures, facilitySales]);

  // 売上グラフデータ
  const chartData = useMemo(() => {
    const revenueData = allMonths.map((m) => {
      const rec = facilitySales.find((s) => s.month === m);
      return rec?.revenue ?? null;
    });
    const momData = allMonths.map((m) => {
      const rec = facilitySales.find((s) => s.month === m);
      return rec?.momRatio ?? null;
    });
    const hasRevenue = revenueData.some((v) => v !== null);
    const hasMom = momData.some((v) => v !== null);

    const datasets = [];
    if (hasRevenue) {
      datasets.push({
        label: "売上金額（万円）",
        data: revenueData.map((v) => v !== null ? v / 10000 : null),
        borderColor: "#6366f1",
        backgroundColor: "#6366f120",
        tension: 0.3,
        spanGaps: true,
        yAxisID: "y",
      });
    }
    if (hasMom) {
      datasets.push({
        label: "前月比（%）",
        data: momData,
        borderColor: "#10b981",
        backgroundColor: "#10b98120",
        borderDash: [4, 4],
        tension: 0.3,
        spanGaps: true,
        yAxisID: "y1",
      });
    }
    return { labels: allMonths, datasets };
  }, [allMonths, facilitySales]);

  const chartOptions = {
    responsive: true,
    interaction: { mode: "index" as const, intersect: false },
    plugins: { legend: { position: "top" as const } },
    scales: {
      y: { type: "linear" as const, position: "left" as const, title: { display: true, text: "売上（万円）" } },
      y1: { type: "linear" as const, position: "right" as const, grid: { drawOnChartArea: false }, title: { display: true, text: "前月比（%）" } },
    },
  };

  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">施策 × 売上 タイムライン</h1>
          <p className="text-sm text-gray-500">どの施策がいつ効いたかを時系列で確認できます。</p>
        </div>

        {/* 施設セレクター */}
        <div className="mb-6">
          <select
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {facilities.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-12 justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-400" />
            データを読み込み中...
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{error}</div>
        ) : allMonths.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            <p className="mb-2">データがまだ入力されていません。</p>
            <p>スプレッドシートの「施策マスター」「売上データ」に情報を入力してください。</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 売上グラフ */}
            {chartData.datasets.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">売上推移</h2>
                <Line data={chartData} options={chartOptions} />
              </div>
            )}

            {/* 施策タイムライン */}
            {facilityMeasures.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">施策タイムライン</h2>
                <div className="overflow-x-auto">
                  <div style={{ minWidth: Math.max(allMonths.length * 48, 600) }}>
                    {/* 月ラベル */}
                    <div className="flex mb-2">
                      <div className="w-36 flex-shrink-0" />
                      {allMonths.map((m) => (
                        <div key={m} className="flex-1 text-xs text-gray-400 text-center" style={{ minWidth: 48 }}>
                          {m.slice(5)}月
                        </div>
                      ))}
                    </div>
                    {/* 施策バー */}
                    {facilityMeasures.map((measure, i) => {
                      const color = CATEGORY_COLORS[measure.category] ?? CATEGORY_COLORS["その他"];
                      const activeMonths = measure.startMonth && measure.endMonth
                        ? new Set(monthsBetween(measure.startMonth, measure.endMonth))
                        : new Set<string>();
                      return (
                        <div key={i} className="flex items-center mb-2 group">
                          <div className="w-36 flex-shrink-0 pr-2">
                            <p className="text-xs font-medium text-gray-700 truncate" title={measure.name}>{measure.name}</p>
                            <p className="text-xs text-gray-400">{measure.category}</p>
                          </div>
                          {allMonths.map((m) => {
                            const active = activeMonths.has(m);
                            return (
                              <div
                                key={m}
                                className="flex-1 h-7 mx-0.5 rounded transition-opacity"
                                style={{
                                  minWidth: 48,
                                  backgroundColor: active ? color : "#f3f4f6",
                                  opacity: active ? 0.85 : 1,
                                }}
                                title={active ? `${measure.name}（${measure.category}）` : ""}
                              />
                            );
                          })}
                          {measure.docLink && (
                            <a href={measure.docLink} target="_blank" rel="noopener noreferrer" className="ml-2 text-gray-400 hover:text-indigo-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>
                      );
                    })}
                    {/* 凡例 */}
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                      {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                        <div key={cat} className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                          <span className="text-xs text-gray-500">{cat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 効果の高い施策ランキング */}
            {facilityMeasures.filter((m) => m.evaluation && m.evaluation !== "未評価").length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">施策評価</h2>
                <div className="space-y-2">
                  {["S","A","B","C"].map((grade) => {
                    const items = facilityMeasures.filter((m) => m.evaluation === grade);
                    if (items.length === 0) return null;
                    return items.map((m, i) => (
                      <div key={`${grade}-${i}`} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          grade === "S" ? "bg-yellow-100 text-yellow-700" :
                          grade === "A" ? "bg-green-100 text-green-700" :
                          grade === "B" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                        }`}>{grade}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{m.name}</p>
                          <p className="text-xs text-gray-400">{m.category} ・ {m.startMonth}〜{m.endMonth}</p>
                        </div>
                      </div>
                    ));
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
