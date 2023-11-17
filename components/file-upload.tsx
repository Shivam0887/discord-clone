"use client";

import { X } from "lucide-react";
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

  if (value && fileType !== "pdf") {
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

  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0].url);
      }}
      onUploadError={(error: Error) => {
        console.log(error.message);
      }}
    />
  );
};

export default FileUpload;
