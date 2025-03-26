
import React from 'react';
import { AIFormatSuggestions } from '../ai/AIFormatSuggestions';
import { ScrollArea } from '../../ui/scroll-area';

export const AIPanel = () => {
  return (
    <div className="w-full h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">AI Layout Assistant</h2>
        <ScrollArea className="h-[calc(100vh-150px)]">
          <div className="pr-4">
            <AIFormatSuggestions />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
