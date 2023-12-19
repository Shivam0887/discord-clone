"use client";

import { FileIcon, VideoIcon, X } from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";
import "@uploadthing/react/styles.css";
import Image from "next/image";

interface FileUploadProps {
  endpoint: "serverImage" | "attachedFile";
  value: string;
  onChange: (url?: string) => void;
}

const FileUpload = ({ endpoint, value, onChange }: FileUploadProps) => {
  const fileType = value?.split(".").pop();

  if (value && fileType !== "pdf" && fileType !== "mp4") {
    return (
      <div className="relative h-20 w-20">
        <Image src={value} alt="uploaded image" fill className="rounded-full" />
        <button
          type="button"
          onClick={() => onChange("")}
          className="bg-red-500 text-white p-1 rounded-full absolute top-0 
          right-0 shadow-sm"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (value && (fileType === "pdf" || fileType === "mp4")) {
    return (
      <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
        {fileType === "pdf" ? (
          <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
        ) : (
          <VideoIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
        )}
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
        >
          {value}
        </a>
        <button
          type="button"
          onClick={() => onChange("")}
          className="bg-red-500 text-white p-1 rounded-full absolute -top-2 
          -right-2 shadow-sm"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0].url);
      }}
      onUploadError={(error: Error) => {
        console.log("uploadthing error - ", error.message);
      }}
    />
  );
};

export default FileUpload;
