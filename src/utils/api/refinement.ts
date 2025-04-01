import axios from 'axios';

export const refineLayouts = async (layoutData: any) => {
    try {
        console.log('Enviando dados para refinamento:', layoutData);
        
        // Garantir que os dados obrigatórios estão presentes
        if (!layoutData.currentFormat) {
            throw new Error('Formato atual não especificado');
        }
        
        if (!layoutData.elements || !Array.isArray(layoutData.elements) || layoutData.elements.length === 0) {
            throw new Error('Elementos não fornecidos ou inválidos');
        }
        
        if (!layoutData.targetFormats || !Array.isArray(layoutData.targetFormats) || layoutData.targetFormats.length === 0) {
            throw new Error('Formatos de destino não fornecidos ou inválidos');
        }
        
        // Configurando axios com headers corretos
        const response = await axios.post('http://localhost:3000/refinement/refine-layout', layoutData, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            withCredentials: false, // Deixar como false para evitar problemas com CORS
        });
        
        console.log('Resposta do servidor:', response.data);
        return response.data;
    } catch (error) {
        console.error('Erro ao refinar layouts:', error);
        
        if (axios.isAxiosError(error)) {
            if (error.response) {
                // O servidor respondeu com um status diferente de 2xx
                console.error('Detalhes do erro:', error.response.data);
                throw new Error(`Erro do servidor: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                // A requisição foi feita mas não houve resposta
                throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 3000.');
            } else {
                // Erro na configuração da requisição
                throw new Error(`Erro na configuração da requisição: ${error.message}`);
            }
        }
        
        throw error;
    }
};