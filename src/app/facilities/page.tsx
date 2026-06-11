"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import Navigation from "@/components/Navigation";
import FacilityCard from "@/components/FacilityCard";
import { listFacilityFolders, type DriveFolder } from "@/lib/driveClient";

export default function FacilitiesPage() {
  const { accessToken } = useGoogleAuth();
  const router = useRouter();
  const [facilities, setFacilities] = useState<DriveFolder[]>([]);
  const [filtered, setFiltered] = useState<DriveFolder[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) { router.push("/"); return; }
    listFacilityFolders(accessToken)
      .then((data) => { setFacilities(data); setFiltered(data); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [accessToken, router]);

  useEffect(() => {
    if (!query.trim()) { setFiltered(facilities); return; }
    setFiltered(facilities.filter((f) => f.name.toLowerCase().includes(query.toLowerCase())));
  }, [query, facilities]);

  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">施設一覧</h1>
          <p className="text-sm text-gray-500">各施設のフォルダをクリックして資料を確認できます。</p>
        </div>
        <div className="mb-6">
          <div className="relative max-w-sm">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="施設名で絞り込み..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
            </svg>
          </div>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">
            {query ? `「${query}」に一致する施設が見つかりません。` : "施設データがありません。"}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((f) => (
              <FacilityCard key={f.id} id={f.id} name={f.name} modifiedTime={f.modifiedTime} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
