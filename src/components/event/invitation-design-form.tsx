'use client';

import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/shared/image-upload";
import { Download } from "lucide-react";
import { generateCardPDF } from "@/lib/pdf-generator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PreviewModal } from '../shared/preview-modal';

interface InvitationDesignFormProps {
  initialDesign?: any;
  onSave: (design: any) => void;
  event: any;
}

export function InvitationDesignForm({ initialDesign, onSave, event }: InvitationDesignFormProps) {
  const [selectedDesign, setSelectedDesign] = React.useState(initialDesign?.template || 'modern');
  const [imageUrl, setImageUrl] = React.useState(event?.imageUrl || null);
  const [showPreview, setShowPreview] = React.useState(false);

  const designs = [
    { 
      id: 'modern', 
      name: 'Modern', 
      description: 'Clean and contemporary design with bold typography',
      preview: 'Sleek layout with emphasis on visual hierarchy'
    },
    { 
      id: 'classic', 
      name: 'Classic', 
      description: 'Traditional and elegant design with refined details',
      preview: 'Timeless style with sophisticated elements'
    },
    { 
      id: 'minimalist', 
      name: 'Minimalist', 
      description: 'Simple and understated design focusing on essentials',
      preview: 'Clean space with essential information'
    },
    { 
      id: 'corporate', 
      name: 'Corporate', 
      description: 'Professional design for business events',
      preview: 'Structured layout with corporate elements'
    },
    { 
      id: 'creative', 
      name: 'Creative', 
      description: 'Artistic and expressive design for creative events',
      preview: 'Dynamic layout with creative elements'
    },
    { 
      id: 'elegant', 
      name: 'Elegant', 
      description: 'Sophisticated design for formal events',
      preview: 'Refined style with elegant typography'
    },
    { 
      id: 'festive', 
      name: 'Festive', 
      description: 'Celebratory design for special occasions',
      preview: 'Joyful layout with festive elements'
    },
    { 
      id: 'tech', 
      name: 'Tech', 
      description: 'Modern tech-inspired design with geometric elements',
      preview: 'Digital-style layout with tech aesthetics'
    }
  ];

  const handleSave = () => {
    onSave({
      ...initialDesign,
      template: selectedDesign,
      imageUrl,
    });
  };

  const handleDownloadPDF = async () => {
    await generateCardPDF({
      ...event,
      design: { template: selectedDesign },
      imageUrl,
    }, 'event');
  };

  const handleDesignSelect = (design: string) => {
    setSelectedDesign(design);
    setShowPreview(true);
  };

  return (
    <div className="space-y-6">
      {selectedDesign && (
        <Alert className="mb-4">
          <AlertDescription>
            This design will be used to generate your PDF invitation card. Please review all details before downloading.
          </AlertDescription>
        </Alert>
      )}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Upload Image (Optional)</h3>
        <ImageUpload 
          value={imageUrl} 
          onChange={(url) => setImageUrl(url)}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Select Design</h3>
        <RadioGroup
          value={selectedDesign}
          onValueChange={handleDesignSelect}
          className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
        >
          {designs.map((design) => (
            <div key={design.id} className="relative">
              <RadioGroupItem value={design.id} id={design.id} className="peer sr-only" />
              <Label 
                htmlFor={design.id} 
                className="flex flex-col h-full p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all duration-200"
              >
                <span className="font-semibold mb-1">{design.name}</span>
                <span className="text-sm text-gray-500 mb-2">{design.description}</span>
                <span className="text-xs text-gray-400 italic">{design.preview}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={handleDownloadPDF}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
        <Button onClick={handleSave}>
          Save Design
        </Button>
      </div>
      {showPreview && (
        <PreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          design={selectedDesign}
          data={event}
          type="event"
        />
      )}
    </div>
  );
}
