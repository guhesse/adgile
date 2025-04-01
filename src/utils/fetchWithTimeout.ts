/**
 * Realiza uma chamada fetch com timeout
 */
export const fetchWithTimeout = async (url: string, options: RequestInit & { timeout?: number } = {}): Promise<Response> => {
  const { timeout = 30000, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const { signal } = controller;
  
  // Combinar o signal do AbortController com o signal passado nas options, se houver
  const requestOptions: RequestInit = {
    ...fetchOptions,
    signal: signal
  };
  
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, requestOptions);
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Verificar se o erro foi causado pelo timeout
    if (error.name === 'AbortError') {
      throw new Error(`A requisição para ${url} excedeu o timeout de ${timeout}ms`);
    }
    
    throw error;
  }
};
