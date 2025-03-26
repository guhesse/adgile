
import { LayoutTemplate, TrainingData, AdminStats } from "../types/admin";

// Local storage keys
const TEMPLATES_STORAGE_KEY = 'adgile_layout_templates';
const TRAINING_DATA_KEY = 'adgile_training_data';

// Generate a unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Save a layout template
export const saveLayoutTemplate = (template: LayoutTemplate): LayoutTemplate => {
  const now = new Date().toISOString();
  const newTemplate = {
    ...template,
    id: template.id || generateId(),
    createdAt: template.createdAt || now,
    updatedAt: now
  };

  const templates = getLayoutTemplates();
  const existingIndex = templates.findIndex(t => t.id === newTemplate.id);
  
  if (existingIndex >= 0) {
    templates[existingIndex] = newTemplate;
  } else {
    templates.push(newTemplate);
  }

  localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  return newTemplate;
};

// Get all layout templates
export const getLayoutTemplates = (): LayoutTemplate[] => {
  const storedTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY);
  return storedTemplates ? JSON.parse(storedTemplates) : [];
};

// Delete a layout template
export const deleteLayoutTemplate = (templateId: string): boolean => {
  const templates = getLayoutTemplates();
  const filteredTemplates = templates.filter(t => t.id !== templateId);
  
  if (filteredTemplates.length < templates.length) {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(filteredTemplates));
    return true;
  }
  
  return false;
};

// Get a single layout template by ID
export const getLayoutTemplateById = (templateId: string): LayoutTemplate | null => {
  const templates = getLayoutTemplates();
  return templates.find(t => t.id === templateId) || null;
};

// Save training data
export const saveTrainingData = async (data: TrainingData): Promise<boolean> => {
  try {
    localStorage.setItem(TRAINING_DATA_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Erro ao salvar dados de treinamento:", error);
    return false;
  }
};

// Get training data
export const getTrainingData = async (): Promise<TrainingData | null> => {
  try {
    const data = localStorage.getItem(TRAINING_DATA_KEY);
    if (!data) return null;
    return JSON.parse(data) as TrainingData;
  } catch (error) {
    console.error("Erro ao recuperar dados de treinamento:", error);
    return null;
  }
};

// Check if training data exists
export const hasTrainingData = async (): Promise<boolean> => {
  try {
    const data = localStorage.getItem(TRAINING_DATA_KEY);
    return !!data;
  } catch (error) {
    console.error("Erro ao verificar dados de treinamento:", error);
    return false;
  }
};

// Clear training data
export const clearTrainingData = async (): Promise<boolean> => {
  try {
    localStorage.removeItem(TRAINING_DATA_KEY);
    return true;
  } catch (error) {
    console.error("Erro ao limpar dados de treinamento:", error);
    return false;
  }
};

// Get admin statistics
export const getAdminStats = async (): Promise<AdminStats> => {
  const templates = getLayoutTemplates();
  
  // Use await for the async function
  const trainingData = await getTrainingData();
  
  const verticalTemplates = templates.filter(t => t.orientation === 'vertical').length;
  const horizontalTemplates = templates.filter(t => t.orientation === 'horizontal').length;
  const squareTemplates = templates.filter(t => t.orientation === 'square').length;
  
  return {
    totalTemplates: templates.length,
    verticalTemplates,
    horizontalTemplates,
    squareTemplates,
    lastTrainingDate: trainingData?.modelMetadata?.trainedAt,
    modelAccuracy: trainingData?.modelMetadata?.accuracy
  };
};

// Generate format presets (100 vertical, 100 horizontal, 50 square)
export const generateFormatPresets = () => {
  const verticalFormats: { width: number, height: number }[] = [];
  const horizontalFormats: { width: number, height: number }[] = [];
  const squareFormats: { width: number, height: number }[] = [];
  
  // Generate vertical formats (varying from thin to wide)
  for (let i = 0; i < 100; i++) {
    // Width varies from 320 to 720
    const width = 320 + Math.floor((i % 20) * 20);
    // Height varies from 640 to 1200
    const height = 640 + Math.floor((i % 25) * 24);
    verticalFormats.push({ width, height });
  }
  
  // Generate horizontal formats (varying from thin to tall)
  for (let i = 0; i < 100; i++) {
    // Width varies from 800 to 1920
    const width = 800 + Math.floor((i % 28) * 40);
    // Height varies from 400 to 800
    const height = 400 + Math.floor((i % 20) * 20);
    horizontalFormats.push({ width, height });
  }
  
  // Generate square formats (varying sizes)
  for (let i = 0; i < 50; i++) {
    // Size varies from 400 to 1200
    const size = 400 + (i * 16);
    squareFormats.push({ width: size, height: size });
  }
  
  return {
    vertical: verticalFormats,
    horizontal: horizontalFormats,
    square: squareFormats
  };
};
