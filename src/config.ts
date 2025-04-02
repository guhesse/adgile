// Configuração do ambiente da aplicação

// URL base da API - verifica se estamos no navegador e usa um valor padrão
export const apiBaseUrl = typeof window !== 'undefined' && window.ENV?.API_URL 
  ? window.ENV.API_URL 
  : 'http://localhost:3333/api';

// Configurações de serviços externos
export const cloudinaryConfig = {
    cloudName: typeof window !== 'undefined' && window.ENV?.CLOUDINARY_CLOUD_NAME 
      ? window.ENV.CLOUDINARY_CLOUD_NAME 
      : 'your-cloud-name',
    uploadPreset: typeof window !== 'undefined' && window.ENV?.CLOUDINARY_UPLOAD_PRESET 
      ? window.ENV.CLOUDINARY_UPLOAD_PRESET 
      : 'unsigned_upload',
};

// Versão da aplicação
export const appVersion = typeof window !== 'undefined' && window.ENV?.APP_VERSION 
  ? window.ENV.APP_VERSION 
  : '0.1.0';

// Recursos disponíveis
export const features = {
    aiGeneration: typeof window !== 'undefined' && window.ENV?.FEATURE_AI_GENERATION === 'true',
    teamCollaboration: typeof window !== 'undefined' && window.ENV?.FEATURE_TEAM_COLLABORATION === 'true',
    analytics: typeof window !== 'undefined' && window.ENV?.FEATURE_ANALYTICS === 'true',
};

// Adicionar interface para janela global
declare global {
  interface Window {
    ENV?: {
      API_URL?: string;
      CLOUDINARY_CLOUD_NAME?: string;
      CLOUDINARY_UPLOAD_PRESET?: string;
      APP_VERSION?: string;
      FEATURE_AI_GENERATION?: string;
      FEATURE_TEAM_COLLABORATION?: string;
      FEATURE_ANALYTICS?: string;
    }
  }
}
