import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

interface User {
    user_id: number;
    name: string;
    email: string;
    tenant_id: number;
}

interface AuthContextData {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Componente wrapper para garantir que useNavigate funcione apenas em contexto de Router
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <AuthContextProvider>
            {children}
        </AuthContextProvider>
    );
};

// Componente interno que usa hooks do React Router
const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check if user is stored in localStorage
        const storedUser = localStorage.getItem('adgile_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            // Implementar chamada real de API para login quando estiver disponível
            // const response = await axios.post('/api/auth/login', { email, password });

            // Simulação da resposta do servidor para desenvolvimento
            const mockUser = {
                user_id: 1,
                name: 'Usuário de Teste',
                email: email,
                tenant_id: 1
            };

            // const { user } = response.data;
            setUser(mockUser);
            localStorage.setItem('adgile_user', JSON.stringify(mockUser));
            navigate('/dashboard');
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('adgile_user');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: !!user,
                user,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth(): AuthContextData {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
