
import { BannerSize } from "@/components/editor/types";

// Função para gerar um nome de arquivo de thumbnail baseado no formato
export const generateThumbnailName = (format: { width: number, height: number, name: string }): string => {
  const normalized = format.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `${normalized}-${format.width}x${format.height}.png`;
};

// Função para gerar um subconjunto de formatos com thumbnails
export const generateFormats = (count: { vertical: number, horizontal: number, square: number }): BannerSize[] => {
  const formats: BannerSize[] = [];
  
  // Formatos verticais comuns
  const commonVertical = [
    { name: "Instagram Story", width: 1080, height: 1920 },
    { name: "Pinterest Pin", width: 735, height: 1102 },
    { name: "Mobile Banner", width: 320, height: 480 },
    { name: "Mobile Portrait", width: 360, height: 640 },
    { name: "Snapchat Ad", width: 1080, height: 1920 },
  ];
  
  // Formatos horizontais comuns
  const commonHorizontal = [
    { name: "Facebook Ad", width: 1200, height: 628 },
    { name: "Twitter Post", width: 1200, height: 675 },
    { name: "LinkedIn Banner", width: 1584, height: 396 },
    { name: "YouTube Thumbnail", width: 1280, height: 720 },
    { name: "Google Display", width: 300, height: 250 },
  ];
  
  // Formatos quadrados comuns
  const commonSquare = [
    { name: "Instagram Post", width: 1080, height: 1080 },
    { name: "Facebook Profile", width: 360, height: 360 },
    { name: "Twitter Profile", width: 400, height: 400 },
    { name: "App Icon", width: 512, height: 512 },
    { name: "LinkedIn Company Logo", width: 300, height: 300 },
  ];
  
  // Adicionar formatos verticais
  for (let i = 0; i < Math.min(commonVertical.length, count.vertical); i++) {
    formats.push({
      ...commonVertical[i],
      thumbnail: `vertical-${i+1}.png`
    } as BannerSize);
  }
  
  // Gerar formatos verticais adicionais, se necessário
  for (let i = commonVertical.length; i < count.vertical; i++) {
    // Variação na largura de 320 a 720
    const width = 320 + Math.floor((i % 20) * 20);
    // Variação na altura de 640 a 1920
    const height = 640 + Math.floor((i % 25) * 50);
    const format = {
      name: `Vertical ${i+1}`,
      width,
      height,
      thumbnail: `vertical-${i+1}.png`
    } as BannerSize;
    formats.push(format);
  }
  
  // Adicionar formatos horizontais
  for (let i = 0; i < Math.min(commonHorizontal.length, count.horizontal); i++) {
    formats.push({
      ...commonHorizontal[i],
      thumbnail: `horizontal-${i+1}.png`
    } as BannerSize);
  }
  
  // Gerar formatos horizontais adicionais, se necessário
  for (let i = commonHorizontal.length; i < count.horizontal; i++) {
    // Variação na largura de 800 a 1920
    const width = 800 + Math.floor((i % 28) * 40);
    // Variação na altura de 400 a 800
    const height = 400 + Math.floor((i % 20) * 20);
    const format = {
      name: `Horizontal ${i+1}`,
      width,
      height,
      thumbnail: `horizontal-${i+1}.png`
    } as BannerSize;
    formats.push(format);
  }
  
  // Adicionar formatos quadrados
  for (let i = 0; i < Math.min(commonSquare.length, count.square); i++) {
    formats.push({
      ...commonSquare[i],
      thumbnail: `square-${i+1}.png`
    } as BannerSize);
  }
  
  // Gerar formatos quadrados adicionais, se necessário
  for (let i = commonSquare.length; i < count.square; i++) {
    // Tamanho varia de 300 a 1080
    const size = 300 + (i * 30);
    const format = {
      name: `Square ${i+1}`,
      width: size,
      height: size,
      thumbnail: `square-${i+1}.png`
    } as BannerSize;
    formats.push(format);
  }
  
  return formats;
};

// Função que retorna um subconjunto otimizado para não estourar quota
export const getOptimizedFormats = (): BannerSize[] => {
  // Retorna um conjunto reduzido para evitar problemas de quota
  return generateFormats({ vertical: 100, horizontal: 100, square: 25 });
};

// Função para pegar apenas os formatos mais comuns
export const getCommonFormats = (): BannerSize[] => {
  return generateFormats({ vertical: 5, horizontal: 5, square: 5 });
};
