import { toast } from "sonner";
import axios from "axios";

// API URL base - usar valor fixo para o ambiente do navegador
// Em produção, essa URL deveria ser configurada no build time
const API_URL = 'http://localhost:3333';
console.log("ImageOperations: API_URL configurada para", API_URL);

// Function to handle image upload
export const handleImageUpload = async (file: File): Promise<string> => {
  console.log("ImageOperations: Iniciando upload do arquivo:", file.name);
  
  return new Promise((resolve, reject) => {
    // Check file type first
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      console.error("ImageOperations: Tipo de arquivo inválido:", file.type);
      toast.error("Tipo de arquivo inválido. Por favor, use imagens JPG, PNG, GIF, SVG ou WebP.");
      reject(new Error("Invalid file type"));
      return;
    }

    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error("ImageOperations: Arquivo muito grande:", file.size, "bytes");
      toast.error("A imagem é muito grande. O tamanho máximo é 5MB.");
      reject(new Error("File too large"));
      return;
    }

    // Show loading toast
    const loadingToast = toast.loading("Carregando imagem...");

    // Criar FormData para enviar a imagem
    const formData = new FormData();
    formData.append('image', file);
    console.log("ImageOperations: FormData criado com o campo 'image'");

    const uploadUrl = `${API_URL}/api/cdn/upload`;
    console.log("ImageOperations: Enviando requisição para:", uploadUrl);

    // Enviar para a API
    axios.post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        console.log("ImageOperations: Resposta recebida:", response.data);
        toast.success("Imagem carregada com sucesso!");
        
        // Log para debug da URL retornada
        console.log("ImageOperations: URL retornada pelo CDN:", response.data.url);
        
        // Retorna a URL da imagem no CDN
        resolve(response.data.url);
      })
      .catch(error => {
        toast.dismiss(loadingToast);
        console.error("ImageOperations: Erro na requisição:", error.message);
        toast.error("Falha ao fazer upload da imagem");
        
        // Log detalhado do erro
        if (error.response) {
          console.error("ImageOperations: Status:", error.response.status);
          console.error("ImageOperations: Dados:", error.response.data);
        } else if (error.request) {
          console.error("ImageOperations: Nenhuma resposta recebida. Requisição:", error.request);
        }
        
        console.log("ImageOperations: Tentando fallback para base64...");
        // Fallback: se falhar, carrega como base64 localmente
        fallbackToLocalBase64(file)
          .then(base64 => {
            console.log("ImageOperations: Fallback para base64 bem-sucedido");
            resolve(base64);
          })
          .catch(err => {
            console.error("ImageOperations: Fallback para base64 falhou:", err);
            reject(err);
          });
      });
  });
};

// Fallback para carregamento local como base64 se o CDN falhar
const fallbackToLocalBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error("Failed to load image"));
      }
    };
    reader.onerror = () => {
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
