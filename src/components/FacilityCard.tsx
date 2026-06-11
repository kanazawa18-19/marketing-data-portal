"use client";

import Link from "next/link";

interface Props {
  id: string;
  name: string;
  modifiedTime?: string;
}

export default function FacilityCard({ id, name, modifiedTime }: Props) {
  const date = modifiedTime
    ? new Date(modifiedTime).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <Link href={`/facility/?id=${id}&name=${encodeURIComponent(name)}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
            <svg
              className="w-5 h-5 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors">
              {name}
            </h3>
            {date && (
              <p className="text-xs text-gray-400 mt-1">更新: {date}</p>
            )}
          </div>
          <svg
            className="w-4 h-4 text-gray-400 group-hover:text-indigo-400 flex-shrink-0 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
