
/**
 * Type definitions for PSD import functionality
 */

import { BannerSize } from "../../../types";

/**
 * Structure for storing PSD file data
 */
export interface PSDFileData {
  fileName: string;
  width: number;
  height: number;
  layers: {
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
  }[];
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
  content?: string;
  imageUrl?: string;
}
