
import { BannerSize } from '@/components/editor/types';

/**
 * Generate predefined banner sizes
 * @returns Array of BannerSize objects
 */
export const generateBannerSizes = (): BannerSize[] => {
  return [
    {
      name: "Instagram Post",
      width: 1080,
      height: 1080
    },
    {
      name: "Instagram Story",
      width: 1080,
      height: 1920
    },
    {
      name: "Facebook Post",
      width: 1200,
      height: 630
    },
    {
      name: "Twitter Post",
      width: 1200,
      height: 675
    },
    {
      name: "LinkedIn Post",
      width: 1200,
      height: 627
    },
    {
      name: "YouTube Thumbnail",
      width: 1280,
      height: 720
    }
  ];
};

/**
 * Generate common square banner sizes
 * @returns Array of square BannerSize objects
 */
export const generateSquareSizes = (): BannerSize[] => {
  return [
    {
      name: "Small Square",
      width: 600,
      height: 600
    },
    {
      name: "Medium Square",
      width: 1080,
      height: 1080
    },
    {
      name: "Large Square",
      width: 1500,
      height: 1500
    }
  ];
};

/**
 * Generate common rectangle banner sizes
 * @returns Array of rectangle BannerSize objects
 */
export const generateRectangleSizes = (): BannerSize[] => {
  return [
    {
      name: "Landscape Small",
      width: 800,
      height: 600
    },
    {
      name: "Landscape Medium",
      width: 1200,
      height: 800
    },
    {
      name: "Landscape Large",
      width: 1920,
      height: 1080
    },
    {
      name: "Portrait Small",
      width: 600,
      height: 800
    },
    {
      name: "Portrait Medium",
      width: 800,
      height: 1200
    },
    {
      name: "Portrait Large",
      width: 1080,
      height: 1920
    }
  ];
};
