"use client";
 
import { useUploadThing } from "@/lib/uploadthing";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { Button } from "./button";
 
interface FileUploadProps {
  onChange: (url?: string) => void;
  endpoint: keyof OurFileRouter;
}
 
export function FileUpload({ onChange, endpoint }: FileUploadProps) {
  const { startUpload } = useUploadThing(endpoint);

  return (
    <Button
      variant="outline"
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const res = await startUpload([file]);
            if (res?.[0]) {
              onChange(res[0].url);
            }
          }
        };
        input.click();
      }}
    >
      Upload Image
    </Button>
  );
} 