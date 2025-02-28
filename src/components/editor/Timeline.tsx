
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { EditorElement } from "./types";

interface TimelineProps {
  elements: EditorElement[];
  currentTime: number;
  isPlaying: boolean;
  togglePlayPause: () => void;
  setCurrentTime: (time: number) => void;
  updateAnimations: (time: number) => void;
  setSelectedElement: (element: EditorElement) => void;
}

export const Timeline = ({ 
  elements, 
  currentTime, 
  isPlaying, 
  togglePlayPause, 
  setCurrentTime,
  updateAnimations,
  setSelectedElement 
}: TimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = x / width;
    
    const maxDuration = Math.max(...elements.map(el => 
      (el.style.animationDuration || 0) + (el.style.animationDelay || 0)
    ), 0);
    
    const newTime = percentage * maxDuration;
    setCurrentTime(newTime);
    updateAnimations(newTime);
  };

  const maxDuration = Math.max(
    ...elements.map(el => (el.style.animationDuration || 0) + (el.style.animationDelay || 0)), 
    0
  );

  return (
    <div className="h-32 bg-white border-t p-4 absolute bottom-0 left-0 right-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-medium">Timeline</h3>
          <Button
            onClick={togglePlayPause}
            variant="outline"
            size="sm"
          >
            {isPlaying ? "Pause" : "Play"}
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          Current Time: {currentTime.toFixed(1)}s / Total Duration: {maxDuration.toFixed(1)}s
        </div>
      </div>
      <div 
        ref={timelineRef}
        className="relative h-16 bg-gray-50 rounded border cursor-pointer"
        onClick={handleTimelineClick}
      >
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-purple-500"
          style={{
            left: `${(currentTime / Math.max(maxDuration, 1)) * 100}%`,
            zIndex: 20
          }}
        />
        
        {elements.map((element) => (
          <div
            key={element.id}
            className="absolute h-6 bg-purple-500 rounded cursor-pointer"
            style={{
              left: `${(element.style.animationDelay || 0) * 10}%`,
              width: `${(element.style.animationDuration || 1) * 10}%`,
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0.8
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedElement(element);
            }}
          >
            <div className="text-xs text-white truncate px-2">
              {element.content || element.type}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
