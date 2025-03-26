
import React from 'react';
import { BannerSize } from '../types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AdminFormatSelectorProps {
  onSelectFormat: (format: BannerSize) => void;
  selectedFormat: BannerSize | null;
}

export const AdminFormatSelector = ({
  onSelectFormat,
  selectedFormat,
}: AdminFormatSelectorProps) => {
  // Generate or load formats
  const formats = [
    { name: "Instagram Story", width: 1080, height: 1920, thumbnail: "vertical-1.png" },
    { name: "Pinterest Pin", width: 735, height: 1102, thumbnail: "vertical-2.png" },
    { name: "Facebook Ad", width: 1200, height: 628, thumbnail: "horizontal-1.png" },
    { name: "Twitter Post", width: 1200, height: 675, thumbnail: "horizontal-2.png" },
    { name: "Instagram Post", width: 1080, height: 1080, thumbnail: "square-1.png" },
    { name: "Facebook Profile", width: 360, height: 360, thumbnail: "square-2.png" },
  ];

  return (
    <div className="space-y-4">
      <RadioGroup>
        {formats.map((format, index) => (
          <div 
            key={`${format.name}-${index}`} 
            className={cn(
              "flex items-center space-x-3 py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors",
              selectedFormat?.name === format.name && "bg-blue-50"
            )}
            onClick={() => onSelectFormat(format)}
          >
            <RadioGroupItem 
              value={format.name} 
              id={`format-${index}`} 
              checked={selectedFormat?.name === format.name}
            />
            <div className="w-12 h-12 relative flex-shrink-0 border rounded overflow-hidden bg-gray-50">
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)'
                }}
              >
                <div 
                  className="bg-white"
                  style={{
                    width: '80%',
                    height: format.width > format.height ? '60%' : '80%',
                    maxWidth: format.width > format.height ? '100%' : '60%',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
                  }}
                ></div>
              </div>
            </div>
            <div className="flex-1">
              <Label 
                htmlFor={`format-${index}`}
                className="font-medium text-sm cursor-pointer"
              >
                {format.name}
              </Label>
              <p className="text-xs text-gray-500">
                {format.width} × {format.height}
              </p>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};
