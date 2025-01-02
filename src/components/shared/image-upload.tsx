'use client';

import { UploadButton } from '@uploadthing/react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col items-center justify-center gap-4">
        {value ? (
          <div className="relative w-full aspect-video">
            <Image
              alt="Upload"
              src={value}
              fill
              className="object-cover rounded-lg"
            />
            <button
              onClick={() => onChange(null)}
              className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        ) : (
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              onChange(res?.[0]?.url);
            }}
            onUploadError={(error: Error) => {
              console.error(error);
            }}
          />
        )}
      </div>
    </div>
  );
}
