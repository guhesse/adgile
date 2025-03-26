
import { useEffect, useState, useRef } from 'react';

type ResizeObserverCallback = (entry: ResizeObserverEntry) => void;

export const useResizeObserver = (
  ref: React.RefObject<HTMLElement>,
  callback: ResizeObserverCallback
) => {
  const observer = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    // Clean up any existing observer
    if (observer.current) {
      observer.current.disconnect();
    }

    // Skip if ref or callback is not available
    if (!ref.current || !callback) return;

    // Create new observer
    observer.current = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        callback(entries[0]);
      }
    });

    // Start observing
    observer.current.observe(ref.current);

    // Clean up
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [ref, callback]);
};
