import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/auth';
import {
    LayoutGrid,
    FileText,
    FolderPlus,
    Plus,
    MoreVertical,
    User
} from "lucide-react";
import FileItem from '../components/dashboard/FileItem';
import NewProjectDialog from '../components/dashboard/LayoutCategoryDialog';
import { ProjectType } from '../components/dashboard/LayoutCategoryDialog';

interface Layout {
    layout_type_id: number;
    name: string;
    description: string;
    tenant_id: number;
    created_by: number;
    created_at: string;
    artboards: Array<{
        artboard_id: number;
        width: number;
        height: number;
    }>;
}

const Dashboard: React.FC = () => {
    const [layouts, setLayouts] = useState<Layout[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLayouts = async () => {
            try {
                setError(null);
                const tenantId = user?.tenant_id || 1;
                const response = await axios.get(`http://localhost:3333/api/layouts?tenantId=${tenantId}`);

                if (response.data && Array.isArray(response.data)) {
                    setLayouts(response.data);
                } else if (response.data && !Array.isArray(response.data)) {
                    if (response.data.data && Array.isArray(response.data.data)) {
                        setLayouts(response.data.data);
                    } else if (response.data.layouts && Array.isArray(response.data.layouts)) {
                        setLayouts(response.data.layouts);
                    } else {
                        console.error('Formato de resposta inesperado:', response.data);
                        setLayouts([]);
                        setError('Formato de resposta inesperado do servidor');
                    }
                } else {
                    setLayouts([]);
                }
            } catch (error) {
                console.error('Erro ao buscar layouts:', error);
                setLayouts([]);
                setError('Erro ao carregar layouts. Por favor, tente novamente.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLayouts();
    }, [user]);

    const openNewProjectDialog = () => {
        setIsNewProjectDialogOpen(true);
    };

    const handleSelectProjectType = async (projectType: ProjectType) => {
        try {
            const newLayout = {
                name: `Novo ${projectType.name}`,
                description: projectType.description,
                categoryId: projectType.categoryId, // Passando o categoryId para o backend
                tenantId: user?.tenant_id || 1,
                createdBy: user?.user_id || 1,
                content: JSON.stringify({
                    format: {
                        width: projectType.width,
                        height: projectType.height,
                        type: projectType.type
                    }
                })
            };

            const response = await axios.post('http://localhost:3333/api/layouts', newLayout);
            setIsNewProjectDialogOpen(false);
            navigate(`/editor/${response.data.layout_type_id}`);
        } catch (error) {
            console.error('Erro ao criar layout:', error);
        }
    };

    const handleLayoutClick = (layoutId: number) => {
        navigate(`/editor/${layoutId}`);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getLayoutType = (layout: Layout) => {
        if (layout.artboards && layout.artboards.length > 0) {
            const artboard = layout.artboards[0];
            if (artboard.width === 1200 && artboard.height === 628) return 'Facebook';
            if (artboard.width === 1080 && artboard.height === 1080) return 'Instagram';
            if (artboard.width === 1920 && artboard.height === 1080) return 'Apresentação';
            if (artboard.width === 600 && artboard.height === 800) return 'E-mail';
        }
        return 'Personalizado';
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Header */}
            <div className="flex w-full h-[98px] px-8 items-center gap-6 border border-gray-300 bg-white opacity-80">
                <div className="flex items-center gap-6 w-full">
                    <div className="flex gap-4">
                        <div className="flex justify-center items-center">
                            <div className="flex h-10 px-3 items-center gap-2.5 rounded-lg bg-gray-100">
                                <FileText className="w-5 h-5 text-gray-700" />
                                <div className="font-inter text-base font-medium text-gray-700 leading-none">Projects</div>
                            </div>
                        </div>
                        <div className="flex justify-center items-center hidden sm:flex">
                            <div className="flex h-10 px-3 items-center gap-2.5 rounded-lg hover:bg-gray-100">
                                <FileText className="w-5 h-5 text-gray-700" />
                                <div className="font-inter text-base font-medium text-gray-700 leading-none">Brand kits</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end items-center gap-3 ml-auto">
                        <div className="font-inter text-base font-medium text-gray-700 leading-none">{user?.name || 'Nome do usuário'}</div>
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="w-6 h-6" stroke="#D5D7DA" fill="#FDFDFD" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1">
                {/* Sidebar */}
                <div className="hidden md:flex w-[280px] h-full py-3 flex-col items-center gap-3 border border-gray-300 bg-[#FDFDFD]">
                    <div className="flex w-[260px] py-2 flex-col items-start gap-4">
                        <div className="flex h-auto flex-col items-start gap-2 w-full">
                            <div className="flex flex-col items-start gap-1 w-full">
                                <div className="flex p-2 items-center gap-3 w-full rounded hover:bg-gray-100 cursor-pointer">
                                    <LayoutGrid className="w-5 h-5 text-gray-700" />
                                    <div className="flex-1 font-geist text-sm text-gray-700 leading-5 font-medium">Designs</div>
                                    <FolderPlus className="w-5 h-5 text-gray-700" />
                                </div>
                            </div>
                            <div className="flex flex-col items-start gap-1 w-full">
                                <div className="flex p-2 items-center gap-3 w-full rounded hover:bg-gray-100 cursor-pointer">
                                    <LayoutGrid className="w-5 h-5 text-gray-700" />
                                    <div className="flex-1 font-geist text-sm text-gray-700 leading-5 font-medium">Custom templates</div>
                                    <FolderPlus className="w-5 h-5 text-gray-700" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full h-[1px] bg-gray-200"></div>
                    <div className="flex p-2 items-center gap-3 w-[260px] rounded hover:bg-gray-100 cursor-pointer">
                        <Plus className="w-5 h-5 text-gray-700" />
                        <div className="flex-1 font-geist text-sm text-gray-700 leading-5 font-medium">Create folder</div>
                    </div>
                </div>

                {/* Main content area */}
                <div className="flex flex-1 flex-col">
                    {/* Toolbar */}
                    <div className="flex h-[73px] px-6 items-center w-full border-b border-gray-200">
                        <div className="flex items-center gap-5">
                            <button className="p-2 hover:bg-gray-100 rounded-md">
                                <LayoutGrid className="w-6 h-6 text-gray-700" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-md">
                                <FileText className="w-6 h-6 text-gray-700" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-md">
                                <FolderPlus className="w-6 h-6 text-gray-700" />
                            </button>
                        </div>

                        <div className="ml-auto">
                            <button
                                onClick={openNewProjectDialog}
                                className="flex px-6 py-2.5 justify-center items-center gap-2 rounded-md bg-purple-600"
                            >
                                <Plus className="w-4 h-4 text-white" />
                                <span className="text-white font-geist text-sm font-medium">New design</span>
                            </button>
                        </div>
                    </div>

                    {/* Files list */}
                    <div className="flex flex-col p-4 flex-1">
                        {/* Table header */}
                        <div className="grid grid-cols-5 gap-4 w-full py-3 px-4 border-b border-gray-200">
                            <div className="font-geist text-sm font-medium text-gray-700">Name</div>
                            <div className="font-geist text-sm font-medium text-gray-700">Last modified</div>
                            <div className="font-geist text-sm font-medium text-gray-700">Tipo de Layout</div>
                            <div className="font-geist text-sm font-medium text-gray-700">Descrição</div>
                            <div className="font-geist text-sm font-medium text-gray-700 text-right">Options</div>
                        </div>

                        {/* Files */}
                        <div className="flex flex-col w-full">
                            {isLoading ? (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 border-4 border-t-purple-700 border-gray-200 rounded-full animate-spin mx-auto"></div>
                                    <p className="mt-4 text-gray-600">Carregando layouts...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-8 text-red-500">{error}</div>
                            ) : layouts.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">Nenhum layout encontrado.</p>
                                    <button
                                        onClick={openNewProjectDialog}
                                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                                    >
                                        Criar novo design
                                    </button>
                                </div>
                            ) : (
                                Array.isArray(layouts) && layouts.map((layout, index) => {
                                    // Criando uma chave composta para garantir unicidade absoluta
                                    const uniqueKey = `layout-${layout.layout_type_id}-${index}`;

                                    return (
                                        <FileItem
                                            key={uniqueKey}
                                            id={layout.layout_type_id}
                                            name={layout.name}
                                            lastModified={formatDate(layout.created_at)}
                                            type={getLayoutType(layout)}
                                            description={layout.description}
                                            onClick={() => handleLayoutClick(layout.layout_type_id)}
                                        />
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Componente de diálogo para novo projeto */}
                    <NewProjectDialog
                        open={isNewProjectDialogOpen}
                        onOpenChange={setIsNewProjectDialogOpen}
                        onSelectProjectType={handleSelectProjectType}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
