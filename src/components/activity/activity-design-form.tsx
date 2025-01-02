'use client';

import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/shared/image-upload";
import { Download } from "lucide-react";
import { generateCardPDF } from "@/lib/pdf-generator";

interface ActivityDesignFormProps {
  initialDesign?: any;
  onSave: (design: any) => void;
  activity: any;
}

export function ActivityDesignForm({ initialDesign, onSave, activity }: ActivityDesignFormProps) {
  const [selectedDesign, setSelectedDesign] = React.useState(initialDesign?.template || 'modern');
  const [imageUrl, setImageUrl] = React.useState(activity?.imageUrl || null);

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
      id: 'workshop', 
      name: 'Workshop', 
      description: 'Professional design for workshops and training sessions',
      preview: 'Organized layout with focus on learning objectives'
    },
    { 
      id: 'creative', 
      name: 'Creative', 
      description: 'Artistic and expressive design for creative activities',
      preview: 'Dynamic layout with creative elements'
    },
    { 
      id: 'sport', 
      name: 'Sport', 
      description: 'Energetic design for sports and fitness activities',
      preview: 'Dynamic style with active elements'
    },
    { 
      id: 'social', 
      name: 'Social', 
      description: 'Friendly and inviting design for social activities',
      preview: 'Warm and welcoming presentation'
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
      ...activity,
      design: { template: selectedDesign },
      imageUrl,
    }, 'activity');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Upload Image (Optional)</h3>
        <ImageUpload 
          value={imageUrl} 
          onChange={(url) => setImageUrl(url)}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Select Design</h3>
        <RadioGroup value={selectedDesign} onValueChange={setSelectedDesign} className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
    </div>
  );
}
