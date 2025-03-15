
/**
 * Type definitions for PSD import functionality
 */

import { BannerSize } from "../../types";

/**
 * Structure for storing PSD file data
 */
export interface PSDFileData {
  fileName: string;
  width: number;
  height: number;
  uploadDate: string; // Add timestamp for when the PSD was uploaded
  storageKey: string; // Add storage key for referencing this PSD later
  layers: PSDLayerInfo[];
}

/**
 * Interface for PSD layer information
 */
export interface PSDLayerInfo {
  id: string;
  name: string;
  type: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  content?: string; // For text layers
  imageUrl?: string; // For image layers
  imageKey?: string; // Storage key for the image
}

/**
 * Type for retrieved PSD metadata from storage
 */
export interface PSDMetadata {
  key: string;
  fileName: string;
  uploadDate: string;
  width: number;
  height: number;
}
