import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const [formData, setFormData] = useState({
        nome: '',
        sobrenome: '',
        email: '',
        senha: '',
    });
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch('http://localhost:3333/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Erro na requisição: ' + response.statusText);
            }

            const data = await response.json();
            if (data.success) {
                alert('Conta criada com sucesso!');
                navigate('/login');
            } else {
                alert(data.message || 'Erro ao criar conta.');
            }
        } catch (error) {
            console.error('Erro ao criar conta:', error);
            alert('Falha ao conectar com o servidor. Tente novamente mais tarde.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="flex flex-col items-center gap-2">
                <h1 className="text-4xl font-bold text-gray-800">Login</h1>
                <p className="text-lg text-gray-600">Crie uma conta</p>
            </div>
            <div className="flex flex-col w-full max-w-md p-6 mt-6 bg-white border border-gray-300 rounded-lg">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Nome</label>
                    <input
                        type="text"
                        name="nome"
                        placeholder="Nome Completo"
                        value={formData.nome}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                </div>
                <div className="flex flex-col gap-2 mt-4">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                </div>
                <button
                    onClick={handleSubmit}
                    className="w-full px-4 py-2 mt-6 text-white bg-purple-700 rounded-lg"
                >
                    Criar com e-mail
                </button>
                <button className="flex items-center justify-center w-full px-4 py-2 mt-4 text-white bg-purple-700 rounded-lg">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16m-7 6h7"
                        />
                    </svg>
                    Entrar com o Google
                </button>
                <p
                    onClick={() => navigate('/login')}
                    className="mt-4 text-sm text-center text-gray-600 underline cursor-pointer"
                >
                    Já tenho uma conta
                </p>
            </div>
        </div>
    );
};

export default LoginForm;
