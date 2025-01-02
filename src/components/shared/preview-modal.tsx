'use client';

import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EventTemplate } from '../event/templates';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import { generateCardPDF } from '@/lib/pdf-generator';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  design: string;
  data: any;
  type: 'event' | 'activity';
}

export function PreviewModal({ isOpen, onClose, design, data, type }: PreviewModalProps) {
  const handleDownload = async () => {
    await generateCardPDF(data, design);
  };

  const formattedData = type === 'activity' ? {
    title: data.title,
    description: data.description,
    startDate: data.startDate,
    endDate: data.endDate,
    location: null,
  } : data;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Preview</h2>
          <div className="relative border rounded-lg p-4 bg-white">
            <EventTemplate event={formattedData} design={design} />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleDownload} className="gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
