"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

export default function Navigation() {
  const { user, signIn, signOut, accessToken } = useGoogleAuth();
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">M</span>
              </div>
              <span className="font-semibold text-gray-900 text-sm">
                マーケティングポータル
              </span>
            </Link>
            {accessToken && (
              <div className="hidden md:flex items-center gap-6">
                <Link
                  href="/"
                  className={`text-sm font-medium transition-colors ${
                    pathname === "/"
                      ? "text-indigo-600 border-b-2 border-indigo-600 pb-1"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  ホーム
                </Link>
                <Link
                  href="/facilities"
                  className={`text-sm font-medium transition-colors ${
                    pathname.startsWith("/facilities")
                      ? "text-indigo-600 border-b-2 border-indigo-600 pb-1"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  施設一覧
                </Link>
                <Link
                  href="/timeline"
                  className={`text-sm font-medium transition-colors ${
                    pathname.startsWith("/timeline")
                      ? "text-indigo-600 border-b-2 border-indigo-600 pb-1"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  施策タイムライン
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {user.picture && (
                  <img
                    src={user.picture}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm text-gray-700 hidden sm:block">
                  {user.name}
                </span>
                <button
                  onClick={signOut}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <button
                onClick={signIn}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                ログイン
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
