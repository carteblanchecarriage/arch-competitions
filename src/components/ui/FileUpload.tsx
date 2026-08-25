"use client";

import { useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { getSignedUploadUrl } from "@/app/actions/storage";
import type { CompetitionAttachment } from "@/data/types";

const DEFAULT_BUCKET = "competition-files";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB — Supabase free-tier limit

const ACCEPTED = [
  ".pdf", ".dwg", ".dxf", ".3dm", ".skp", ".rvt", ".ifc",
  ".zip", ".png", ".jpg", ".jpeg", ".svg", ".xlsx", ".docx",
].join(",");

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["pdf"].includes(ext)) return "📄";
  if (["dwg", "dxf", "3dm", "skp", "rvt", "ifc"].includes(ext)) return "📐";
  if (["png", "jpg", "jpeg", "svg"].includes(ext)) return "🖼";
  if (["zip"].includes(ext)) return "🗜";
  return "📎";
}

interface FileUploadProps {
  files: CompetitionAttachment[];
  onAdd: (attachment: CompetitionAttachment) => void;
  onRemove: (index: number) => void;
  uploadSessionId: string;
  bucket?: string;
}

export function FileUpload({ files, onAdd, onRemove, uploadSessionId, bucket = DEFAULT_BUCKET }: FileUploadProps) {
  const { getAccessToken } = usePrivy();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function uploadFile(file: File) {
    setError(null);
    setProgress(0);

    if (file.size > MAX_BYTES) {
      setError(`File too large — max 50 MB. "${file.name}" is ${formatBytes(file.size)}.`);
      return;
    }

    setUploading(file.name);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not signed in");

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${uploadSessionId}/${safeName}`;

      const signedUrl = await getSignedUploadUrl(token, bucket, path);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        });
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed (${xhr.status})`));
        });
        xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
        xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));
        xhr.open("PUT", signedUrl);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.send(file);
      });

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
      onAdd({ name: file.name, url: publicUrl, size: file.size, mimeType: file.type });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(null);
      setProgress(0);
    }
  }

  async function handleFiles(fileList: FileList) {
    for (const file of Array.from(fileList)) {
      await uploadFile(file);
    }
  }

  return (
    <div className="space-y-3">
      {/* Uploaded files list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-3  border border-gray-200 bg-white px-4 py-2.5 text-sm">
              <span className="text-base" aria-hidden>{fileIcon(f.name)}</span>
              <span className="flex-1 truncate font-medium text-gray-800">{f.name}</span>
              {f.size && (
                <span className="shrink-0 text-xs text-gray-400">{formatBytes(f.size)}</span>
              )}
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="shrink-0 text-gray-300 hover:text-red-400"
                aria-label="Remove"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2  border-2 border-dashed px-6 py-8 transition-colors ${
          dragOver
            ? "border-gray-400 bg-gray-100"
            : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
        }`}
      >
        {uploading ? (
          <>
            <div className="h-5 w-5 animate-spin border-2 border-gray-300 border-t-gray-600" />
            <p className="text-xs text-gray-500 text-center">
              Uploading {uploading}…
              {progress > 0 && <span className="ml-1 font-medium">{progress}%</span>}
            </p>
            {progress > 0 && (
              <div className="w-40 h-1 bg-gray-200">
                <div
                  className="h-1 bg-gray-600 transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <svg className="h-7 w-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400">PDF, DWG, DXF, 3DM, SKP, RVT, images, ZIP · max 50 MB</p>
          </>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
