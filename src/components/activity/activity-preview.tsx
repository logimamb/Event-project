import React from 'react';
import { Activity } from '@prisma/client';
import { ActivityTemplate } from './templates';

interface ActivityPreviewProps {
  activity: Activity;
  design: string;
}

export const ActivityPreview: React.FC<ActivityPreviewProps> = ({ activity, design }) => {
  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Preview</h3>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <ActivityTemplate activity={activity} design={design} />
      </div>
    </div>
  );
};
