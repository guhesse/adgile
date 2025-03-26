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
  TrendingUp,
  Maximize,
  FileCode
} from "lucide-react";
import { AdminLayoutListProps } from "@/types/admin";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
                    {/* Canvas preview with elements */}
                    <div className="absolute inset-0">
                      {layout.elements && layout.elements.length > 0 && (
                        layout.elements.map((element) => (
                          <div 
                            key={element.id}
                            className="absolute"
                            style={{
                              left: `${(element.style.x / layout.width) * 100}%`,
                              top: `${(element.style.y / layout.height) * 100}%`,
                              width: `${(element.style.width / layout.width) * 100}%`,
                              height: `${(element.style.height / layout.height) * 100}%`,
                              backgroundColor: element.type === 'image' ? '#e2e8f0' : 
                                              element.type === 'text' ? 'transparent' : 
                                              element.style.backgroundColor || '#94a3b8',
                              border: '1px solid #cbd5e1',
                              borderRadius: element.style.borderRadius ? `${element.style.borderRadius}px` : '0',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {element.type === 'text' && (
                              <div className="w-full h-1 bg-gray-400"></div>
                            )}
                            {element.type === 'image' && (
                              <FileCode className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-3 pt-2 flex justify-between">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>{layout.name} ({layout.width} × {layout.height}px)</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 border rounded-md overflow-hidden">
                      <div 
                        className="relative mx-auto"
                        style={{ 
                          width: `${Math.min(layout.width, 800)}px`,
                          height: `${Math.min(layout.height, 600)}px`,
                          maxWidth: '100%',
                          backgroundColor: "white",
                          transform: layout.width > 800 ? `scale(${800/layout.width})` : '1',
                          transformOrigin: 'top left'
                        }}
                      >
                        {layout.elements && layout.elements.length > 0 && (
                          layout.elements.map((element) => (
                            <div 
                              key={element.id}
                              className="absolute"
                              style={{
                                left: `${element.style.x}px`,
                                top: `${element.style.y}px`,
                                width: `${element.style.width}px`,
                                height: `${element.style.height}px`,
                                backgroundColor: element.style.backgroundColor || 'transparent',
                                border: '1px solid #e2e8f0',
                                borderRadius: element.style.borderRadius ? `${element.style.borderRadius}px` : '0',
                                overflow: 'hidden'
                              }}
                            >
                              {element.type === 'text' && (
                                <div 
                                  style={{
                                    color: element.style.color || '#000',
                                    fontSize: `${element.style.fontSize || 16}px`,
                                    fontWeight: element.style.fontWeight || 'normal',
                                    fontFamily: element.style.fontFamily || 'sans-serif',
                                    lineHeight: element.style.lineHeight || 1.2,
                                    textAlign: element.style.textAlign || 'left',
                                    padding: '4px'
                                  }}
                                >
                                  {element.content || 'Text Element'}
                                </div>
                              )}
                              {element.type === 'image' && (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                  {element.src ? (
                                    <img 
                                      src={element.src} 
                                      alt={element.alt || 'Image'} 
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  ) : (
                                    <FileCode className="w-8 h-8 text-gray-400" />
                                  )}
                                </div>
                              )}
                              {element.type === 'button' && (
                                <button
                                  className="w-full h-full flex items-center justify-center"
                                  style={{
                                    backgroundColor: element.style.backgroundColor || '#3b82f6',
                                    color: element.style.color || 'white',
                                    fontWeight: element.style.fontWeight || 'bold',
                                    borderRadius: element.style.borderRadius ? `${element.style.borderRadius}px` : '4px'
                                  }}
                                >
                                  {element.content || 'Button'}
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      <p>Created: {new Date(layout.createdAt).toLocaleString()}</p>
                      <p>Last Updated: {new Date(layout.updatedAt).toLocaleString()}</p>
                      <p>Elements: {layout.elements?.length || 0}</p>
                    </div>
                  </DialogContent>
                </Dialog>
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
