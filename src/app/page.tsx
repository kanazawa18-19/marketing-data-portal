"use client";

import { useState, useEffect, useCallback } from "react";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import Navigation from "@/components/Navigation";
import FacilityCard from "@/components/FacilityCard";
import DocumentCard from "@/components/DocumentCard";
import {
  listFacilityFolders,
  searchDrive,
  type DriveFolder,
  type DriveFile,
} from "@/lib/driveClient";

export default function HomePage() {
  const { accessToken, signIn } = useGoogleAuth();
  const [facilities, setFacilities] = useState<DriveFolder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);
    listFacilityFolders(accessToken)
      .then(setFacilities)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [accessToken]);

  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim() || !accessToken) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await searchDrive(accessToken, q);
        setSearchResults(results);
      } finally {
        setIsSearching(false);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    const t = setTimeout(() => doSearch(searchQuery), 500);
    return () => clearTimeout(t);
  }, [searchQuery, doSearch]);

  if (!accessToken) {
    return (
      <>
        <Navigation />
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📂</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              マーケティングポータル
            </h1>
            <p className="text-gray-500 text-sm mb-1">
              マーケティング実行支援サービス
            </p>
            <p className="text-gray-400 text-sm mb-8">
              施設ごとの提案資料・事例を一元管理・検索できます。
              <br />
              社内Googleアカウントでログインしてください。
            </p>
            <button
              onClick={signIn}
              className="inline-flex items-center gap-3 bg-white border border-gray-300 rounded-lg px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Googleでログイン
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヒーロー + 検索 */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-8 text-white">
            <div className="max-w-2xl">
              <p className="text-indigo-200 text-sm font-medium mb-1">
                マーケティング実行支援サービス
              </p>
              <h1 className="text-2xl font-bold mb-2">資料・事例を検索する</h1>
              <p className="text-indigo-200 text-sm mb-6">
                施設名・キーワードで検索して、提案資料や事例ドキュメントをすぐに見つけられます。
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="例: ホテル名、事例、提案書..."
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-400"
                />
                <svg className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
                </svg>
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 検索結果 */}
        {searchQuery ? (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              「{searchQuery}」の検索結果
              {searchResults.length > 0 && (
                <span className="text-gray-400 font-normal ml-1">({searchResults.length}件)</span>
              )}
            </h2>
            {isSearching ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-400" />
                検索中...
              </div>
            ) : searchResults.length === 0 ? (
              <p className="text-sm text-gray-400 py-4">該当する資料が見つかりませんでした。</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.map((f) => <DocumentCard key={f.id} file={f} />)}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">
                施設一覧
                {facilities.length > 0 && (
                  <span className="ml-2 text-gray-400 font-normal">({facilities.length}件)</span>
                )}
              </h2>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {facilities.map((f) => (
                  <FacilityCard key={f.id} id={f.id} name={f.name} modifiedTime={f.modifiedTime} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
