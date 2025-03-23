import React from 'react';
import { ArtboardHeaderProps } from '../types';

export const ArtboardHeader: React.FC<ArtboardHeaderProps> = ({
    size,
    displayName,
    isCollapsed,
    onToggleCollapse
}) => {
    return (
        <div className="flex flex-col items-start w-full">
            <div className="flex flex-col items-start gap-2 w-full">
                <div
                    className="flex min-w-[128px] p-[4px_8px] items-center gap-2 w-full rounded-md cursor-pointer hover:bg-gray-50"
                    onClick={onToggleCollapse}
                >
                    <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.1667 3.99992H1.83333M15.1667 11.9999H1.83333M4.49999 1.33325V14.6666M12.5 1.33325V14.6666" stroke="#414651" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                    <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[#414651] font-sans text-xs font-normal leading-5">
                        {displayName}
                    </div>
                    <svg
                        width="17" height="16"
                        viewBox="0 0 17 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`transform ${isCollapsed ? '' : 'rotate-90'}`}
                    >
                        <path d="M4.5 6L8.5 10L12.5 6" stroke="#414651" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                </div>
            </div>
        </div>
    );
};
