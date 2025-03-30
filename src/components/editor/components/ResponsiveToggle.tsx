
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link, LinkBreak } from "lucide-react";
import { toast } from "sonner";

interface ResponsiveToggleProps {
  initialMode?: 'linked' | 'independent';
  onChange?: (mode: 'linked' | 'independent') => void;
}

export const ResponsiveToggle = ({ 
  initialMode = 'independent', 
  onChange 
}: ResponsiveToggleProps) => {
  const [responsiveMode, setResponsiveMode] = useState<'linked' | 'independent'>(initialMode);

  // On mount, check localStorage for saved preference
  useEffect(() => {
    const savedMode = localStorage.getItem('responsiveMode');
    if (savedMode === 'linked' || savedMode === 'independent') {
      setResponsiveMode(savedMode);
    }
  }, []);

  const toggleMode = () => {
    const newMode = responsiveMode === 'linked' ? 'independent' : 'linked';
    setResponsiveMode(newMode);
    
    // Save to localStorage
    localStorage.setItem('responsiveMode', newMode);
    
    // Trigger callback if provided
    if (onChange) {
      onChange(newMode);
    }
    
    // Show feedback to user
    toast.success(`Modo ${newMode === 'linked' ? 'vinculado' : 'independente'} ativado`);
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-2">
              <Switch
                id="responsive-toggle"
                checked={responsiveMode === 'linked'}
                onCheckedChange={toggleMode}
              />
              <Label htmlFor="responsive-toggle" className="cursor-pointer text-xs flex items-center gap-1">
                {responsiveMode === 'linked' ? (
                  <>
                    <Link className="h-3.5 w-3.5" />
                    <span>Vinculado</span>
                  </>
                ) : (
                  <>
                    <LinkBreak className="h-3.5 w-3.5" />
                    <span>Independente</span>
                  </>
                )}
              </Label>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">
              {responsiveMode === 'linked' 
                ? 'Os elementos serão vinculados entre formatos'
                : 'Cada formato terá elementos independentes'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
