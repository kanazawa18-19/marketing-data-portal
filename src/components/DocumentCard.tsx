"use client";

import { DriveFile, MIME_CONFIG } from "@/lib/driveClient";

export default function DocumentCard({ file }: { file: DriveFile }) {
  const config = MIME_CONFIG[file.mimeType] ?? {
    label: "ファイル",
    bg: "bg-gray-50",
    text: "text-gray-700",
    icon: "📁",
  };

  const date = file.modifiedTime
    ? new Date(file.modifiedTime).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <a
      href={file.webViewLink ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
            {file.name}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.bg} ${config.text}`}
            >
              {config.label}
            </span>
            {date && <span className="text-xs text-gray-400">{date}</span>}
          </div>
        </div>
        <svg
          className="w-4 h-4 text-gray-400 group-hover:text-indigo-400 flex-shrink-0 mt-0.5 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </div>
    </a>
  );
}
