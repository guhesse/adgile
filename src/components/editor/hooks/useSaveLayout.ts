import { useState } from 'react';
import { useCanvas } from '../CanvasContext';
import { saveLayout, Layout } from '@/utils/api/layouts';
import { toast } from 'sonner';

export interface SaveLayoutOptions {
  name: string;
  description?: string;
  categoryId?: number;
  userId?: string;
}

export const useSaveLayout = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { elements, selectedSize, canvasSizes } = useCanvas();

  const saveCanvasAsLayout = async (options: SaveLayoutOptions): Promise<Layout | null> => {
    if (!selectedSize) {
      toast.error("Nenhum formato selecionado para salvar");
      return null;
    }

    try {
      setIsSaving(true);

      // Obter apenas os elementos relevantes para o tamanho selecionado
      const relevantElements = elements.filter(
        el => el.sizeId === selectedSize.name || el.sizeId === 'global'
      );

      if (relevantElements.length === 0) {
        toast.error("Não há elementos para salvar neste formato");
        return null;
      }

      // Preparar os dados do layout para salvar
      const layoutData: Layout = {
        name: options.name,
        description: options.description,
        categoryId: options.categoryId,
        userId: options.userId,
        content: JSON.stringify({
          format: selectedSize,
          elements: relevantElements,
        })
      };

      // Chamar a API para salvar o layout
      const savedLayout = await saveLayout(layoutData);
      toast.success(`Layout "${options.name}" salvo com sucesso!`);
      return savedLayout;
    } catch (error) {
      console.error('Erro ao salvar layout:', error);
      toast.error(`Erro ao salvar layout: ${error.message || 'Erro desconhecido'}`);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const saveMultipleFormats = async (options: SaveLayoutOptions): Promise<Layout[]> => {
    if (!canvasSizes || canvasSizes.length === 0) {
      toast.error("Nenhum formato disponível para salvar");
      return [];
    }

    try {
      setIsSaving(true);
      const savedLayouts: Layout[] = [];

      // Criar um toast de progresso
      const toastId = "saving-layouts-progress";
      toast.loading(`Iniciando salvamento de ${canvasSizes.length} formatos...`, {
        id: toastId,
        duration: Infinity,
      });

      // Para cada formato, criamos um layout separado
      for (let i = 0; i < canvasSizes.length; i++) {
        const size = canvasSizes[i];
        
        // Atualizar o toast com progresso
        toast.loading(`Salvando formato ${i+1}/${canvasSizes.length}: ${size.name}`, {
          id: toastId,
        });

        // Obter elementos específicos deste formato
        const formatElements = elements.filter(
          el => el.sizeId === size.name || el.sizeId === 'global'
        );

        if (formatElements.length > 0) {
          // Nome customizado para cada formato
          const formatName = canvasSizes.length > 1 
            ? `${options.name} - ${size.name}`
            : options.name;

          const layoutData: Layout = {
            name: formatName,
            description: options.description,
            categoryId: options.categoryId,
            userId: options.userId,
            content: JSON.stringify({
              format: size,
              elements: formatElements,
            })
          };

          try {
            const saved = await saveLayout(layoutData);
            savedLayouts.push(saved);
          } catch (error) {
            console.error(`Erro ao salvar formato ${size.name}:`, error);
            // Continuamos mesmo se um formato falhar
          }
        }
      }

      // Atualizar o toast final
      if (savedLayouts.length > 0) {
        toast.success(`${savedLayouts.length} formatos salvos com sucesso!`, {
          id: toastId,
          duration: 5000,
        });
      } else {
        toast.error("Nenhum formato foi salvo. Verifique se há elementos nos formatos.", {
          id: toastId,
        });
      }

      return savedLayouts;
    } catch (error) {
      console.error('Erro ao salvar múltiplos formatos:', error);
      toast.error(`Erro ao salvar layouts: ${error.message || 'Erro desconhecido'}`);
      return [];
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveCanvasAsLayout,
    saveMultipleFormats,
    isSaving
  };
};
