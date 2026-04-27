"use client";

import { useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { getSignedUploadUrl } from "@/app/actions/storage";
import { cn } from "@/lib/utils";

const BUCKET = "competition-images";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  uploadSessionId: string;
}

export function ImageUpload({ value, onChange, uploadSessionId }: ImageUploadProps) {
  const { getAccessToken } = usePrivy();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not signed in");

      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${uploadSessionId}/hero.${ext}`;

      const signedUrl = await getSignedUploadUrl(token, BUCKET, path);

      const res = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!res.ok) throw new Error("Upload failed");

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
      onChange(publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="group relative overflow-hidden rounded-lg border border-gray-200">
          <img src={value} alt="Cover" className="h-48 w-full object-cover" />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <span className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-gray-900">
              Replace photo
            </span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors",
            uploading
              ? "cursor-wait border-gray-200 bg-gray-50"
              : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
          )}
        >
          {uploading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          ) : (
            <>
              <svg className="h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-500">Click to upload cover photo</span>
              <span className="text-xs text-gray-400">JPG, PNG, WebP — landscape recommended</span>
            </>
          )}
        </button>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
