
import { toast } from "sonner";

// Function to handle image upload
export const handleImageUpload = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Check file type first
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error("Tipo de arquivo inválido. Por favor, use imagens JPG, PNG, GIF, SVG ou WebP.");
      reject(new Error("Invalid file type"));
      return;
    }

    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("A imagem é muito grande. O tamanho máximo é 5MB.");
      reject(new Error("File too large"));
      return;
    }

    // Show loading toast
    const loadingToast = toast.loading("Carregando imagem...");

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success("Imagem carregada com sucesso!");
        resolve(e.target.result as string);
      } else {
        toast.dismiss(loadingToast);
        toast.error("Falha ao carregar imagem");
        reject(new Error("Failed to load image"));
      }
    };
    reader.onerror = () => {
      toast.dismiss(loadingToast);
      toast.error("Erro ao ler o arquivo");
      reject(new Error("Error reading file"));
    };
    reader.readAsDataURL(file);
  });
};

// Function to check if an image URL is valid
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;

  // Check if it's a data URL
  if (url.startsWith('data:image/')) {
    return true;
  }

  // Check if it's a web URL with image extension
  const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
  return extensions.some(ext => url.toLowerCase().endsWith(ext)) ||
    url.includes('/image') ||
    url.includes('/img');
};

// Function to load an image from a URL and return a promise
export const loadImageFromUrl = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image from ${url}`));
    img.src = url;
  });
};
