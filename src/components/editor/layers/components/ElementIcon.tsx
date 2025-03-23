import React from 'react';

interface ElementIconProps {
    type: string;
}

export const ElementIcon: React.FC<ElementIconProps> = ({ type }) => {
    switch (type) {
        case 'text':
        case 'paragraph':
            return (
                <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.8333 4.06665H2.5M14.5 8.06665H2.5M10.5667 11.9999H2.5" stroke="#414651" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
            );
        case 'image':
        case 'logo':
            return (
                <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.5 9.99996L12.4427 7.94263C12.1926 7.69267 11.8536 7.55225 11.5 7.55225C11.1464 7.55225 10.8074 7.69267 10.5573 7.94263L4.5 14M3.83333 2H13.1667C13.903 2 14.5 2.59695 14.5 3.33333V12.6667C14.5 13.403 13.903 14 13.1667 14H3.83333C3.09695 14 2.5 13.403 2.5 12.6667V3.33333C2.5 2.59695 3.09695 2 3.83333 2ZM7.83333 6C7.83333 6.73638 7.23638 7.33333 6.5 7.33333C5.76362 7.33333 5.16667 6.73638 5.16667 6C5.16667 5.26362 5.76362 4.66667 6.5 4.66667C7.23638 4.66667 7.83333 5.26362 7.83333 6Z" stroke="#414651" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
            );
        case 'button':
            return (
                <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.8333 4H3.16666C2.43028 4 1.83333 4.59695 1.83333 5.33333V10.6667C1.83333 11.403 2.43028 12 3.16666 12H13.8333C14.5697 12 15.1667 11.403 15.1667 10.6667V5.33333C15.1667 4.59695 14.5697 4 13.8333 4Z" stroke="#414651" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
            );
        case 'layout':
        case 'container':
            return (
                <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.83333 2.66667H14.5M9.83333 6H14.5M9.83333 10H14.5M9.83333 13.3333H14.5M3.16667 2H6.5C6.86819 2 7.16667 2.29848 7.16667 2.66667V6C7.16667 6.36819 6.86819 6.66667 6.5 6.66667H3.16667C2.79848 6.66667 2.5 6.36819 2.5 6V2.66667C2.5 2.29848 2.79848 2 3.16667 2ZM3.16667 9.33333H6.5C6.86819 9.33333 7.16667 9.63181 7.16667 10V13.3333C7.16667 13.7015 6.86819 14 6.5 14H3.16667C2.79848 14 2.5 13.7015 2.5 13.3333V10C2.5 9.63181 2.79848 9.33333 3.16667 9.33333Z" stroke="#414651" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
            );
        default:
            return (
                <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.1667 3.99992H1.83333M15.1667 11.9999H1.83333M4.49999 1.33325V14.6666M12.5 1.33325V14.6666" stroke="#414651" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
            );
    }
};
