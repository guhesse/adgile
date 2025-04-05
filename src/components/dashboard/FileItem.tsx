import React from 'react';
import { Download, MoreVertical, Image } from "lucide-react";

interface FileItemProps {
    id: number;
    name: string;
    lastModified: string;
    type: string;
    description: string;
    onClick: (id: number) => void;
}

const FileItem: React.FC<FileItemProps> = ({ id, name, lastModified, type, description, onClick }: FileItemProps) => {
    return (
        <div 
            className="flex items-center gap-4 w-full py-3 hover:bg-gray-50 transition-colors cursor-pointer" 
            onClick={() => onClick(id)}
            data-item-id={id}
        >
            <div className="grid grid-cols-5 w-full gap-4 items-center">
                <div className="flex items-center gap-3">
                    <div className="flex w-[70px] h-[50px] min-w-[70px] min-h-[50px] justify-center items-center rounded-md border border-dashboard-lightBorder bg-[#FDFDFD]">
                        <Image className="w-6 h-6 text-gray-700" />
                    </div>
                    <div className="font-geist text-sm text-gray-700 font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                        {name || "Untitled"}
                    </div>
                </div>

                <div className="font-geist text-sm text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap">
                    {lastModified}
                </div>

                <div className="font-geist text-sm text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap">
                    {type}
                </div>

                <div className="font-geist text-sm text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap">
                    {description || "Sem descrição"}
                </div>

                <div className="flex justify-end items-center gap-3">
                    <button className="p-1.5 rounded-md hover:bg-gray-100" onClick={(e) => e.stopPropagation()}>
                        <Download className="w-5 h-5 text-gray-700" />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-gray-100" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="w-5 h-5 text-gray-700" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(FileItem);
