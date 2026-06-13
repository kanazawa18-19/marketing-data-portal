"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import Navigation from "@/components/Navigation";
import DocumentCard from "@/components/DocumentCard";
import { listFilesInFolder, MIME_CONFIG, type DriveFile } from "@/lib/driveClient";

function FacilityContent() {
  const { accessToken, ready } = useGoogleAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id") ?? "";
  const name = searchParams.get("name") ?? "施設";
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [filtered, setFiltered] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    if (!ready) return;
    if (!accessToken) { router.push("/"); return; }
    if (!id) return;
    listFilesInFolder(accessToken, id)
      .then((data) => { setFiles(data); setFiltered(data); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [accessToken, ready, id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setFiltered(activeFilter === "all" ? files : files.filter((f) => f.mimeType === activeFilter));
  }, [activeFilter, files]);

  const mimeTypes = Array.from(new Set(files.map((f) => f.mimeType))).filter((m) => MIME_CONFIG[m]);

  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/facilities" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            施設一覧に戻る
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="text-2xl">🏨</span>
            {decodeURIComponent(name)}
          </h1>
          <p className="text-sm text-gray-500">
            {isLoading ? "読み込み中..." : `${files.length}件のファイル`}
          </p>
        </div>

        {!isLoading && mimeTypes.length > 1 && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeFilter === "all" ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"}`}
            >
              すべて ({files.length})
            </button>
            {mimeTypes.map((mime) => {
              const count = files.filter((f) => f.mimeType === mime).length;
              return (
                <button
                  key={mime}
                  onClick={() => setActiveFilter(mime)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeFilter === mime ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"}`}
                >
                  {MIME_CONFIG[mime].label} ({count})
                </button>
              );
            })}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">ファイルが見つかりません。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((file) => <DocumentCard key={file.id} file={file} />)}
          </div>
        )}
      </div>
    </>
  );
}

export default function FacilityPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>}>
      <FacilityContent />
    </Suspense>
  );
}
