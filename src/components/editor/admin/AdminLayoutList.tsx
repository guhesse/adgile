
import React from "react";
import { LayoutTemplate } from "@/components/editor/types/admin";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Eye, 
  Trash2, 
  Calendar, 
  Terminal,
  Square, 
  TrendingUp 
} from "lucide-react";
import { AdminLayoutListProps } from "@/types/admin";

export const AdminLayoutList: React.FC<AdminLayoutListProps> = ({ templates, onDeleteTemplate }) => {
  // Add a safe check for templates array to prevent runtime errors
  const layoutTemplates = templates || [];
  
  return (
    <ScrollArea className="h-[calc(100vh-170px)]">
      <div className="p-4 space-y-4">
        {layoutTemplates.length === 0 ? (
          <div className="text-center p-6 text-gray-500">
            <Terminal className="mx-auto h-8 w-8 opacity-50 mb-2" />
            <p>No layouts found</p>
            <p className="text-xs mt-1">Create and save new layouts to see them here</p>
          </div>
        ) : (
          layoutTemplates.map((layout) => (
            <Card key={layout.id} className="overflow-hidden">
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-sm flex items-center">
                  {layout.orientation === "horizontal" && (
                    <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {layout.orientation === "vertical" && (
                    <TrendingUp className="h-3.5 w-3.5 mr-1.5 rotate-90" />
                  )}
                  {layout.orientation === "square" && (
                    <Square className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {layout.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pb-0">
                <div className="text-xs text-gray-500 flex items-center mb-2">
                  <span className="inline-flex items-center mr-3">
                    <Terminal className="h-3 w-3 mr-1" />
                    {layout.width} × {layout.height}px
                  </span>
                  <span className="inline-flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(layout.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="relative w-full bg-gray-100 rounded-md overflow-hidden border">
                  <div 
                    className="w-full"
                    style={{ 
                      paddingBottom: `${(layout.height / layout.width) * 100}%`,
                      backgroundColor: "#f1f5f9"
                    }}
                  >
                    {/* Layout preview would go here */}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-3 pt-2 flex justify-between">
                <Button variant="outline" size="sm" className="h-8">
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => onDeleteTemplate(layout.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </ScrollArea>
  );
};
