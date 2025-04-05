import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', senha: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (error) setError('');
    };

    const handleLogin = async () => {
        if (!formData.email || !formData.senha) {
            setError('Por favor, preencha todos os campos');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3333/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include', // Importante para enviar/receber cookies
            });
            
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.token) {
                // Não salvar no localStorage, apenas redirecionar
                // O cookie será usado para autenticação
                window.location.href = '/';
            } else {
                setError(data.message || 'Erro ao fazer login.');
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            setError('Falha ao conectar com o servidor. Tente novamente mais tarde.');
        } finally {
            setIsLoading(false);
        }
    };

    // Permitir envio do formulário ao pressionar Enter
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="flex flex-col items-center gap-2">
                <h1 className="text-4xl font-bold text-gray-800">Entrar</h1>
            </div>
            <div className="flex flex-col w-full max-w-md p-6 mt-6 bg-white border border-gray-300 rounded-lg">
                {error && (
                    <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-lg">
                        {error}
                    </div>
                )}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        disabled={isLoading}
                    />
                </div>
                <div className="flex flex-col gap-2 mt-4">
                    <label className="text-sm font-medium text-gray-700">Senha</label>
                    <input
                        type="password"
                        name="senha"
                        placeholder="Senha"
                        value={formData.senha}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        disabled={isLoading}
                    />
                </div>
                <button
                    onClick={handleLogin}
                    className={`w-full px-4 py-2 mt-6 text-white bg-purple-700 rounded-lg ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    disabled={isLoading}
                >
                    {isLoading ? 'Entrando...' : 'Entrar'}
                </button>
                <p
                    onClick={() => !isLoading && navigate('/')}
                    className={`mt-4 text-sm text-center text-gray-600 underline cursor-pointer ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    Criar uma conta
                </p>
            </div>
        </div>
    );
};

export default Login;
