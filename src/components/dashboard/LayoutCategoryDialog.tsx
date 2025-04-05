import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Layout, Image, FileText } from "lucide-react";

export interface ProjectType {
    name: string;
    description: string;
    icon: any;
    width: number;
    height: number;
    type: string;
    categoryId: string; // Alterado para string
}

interface NewProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectProjectType: (type: ProjectType) => void;
}

const NewProjectDialog = ({ open, onOpenChange, onSelectProjectType }: NewProjectDialogProps) => {
    const projectOptions: ProjectType[] = [
        {
            name: "Email",
            description: "Exporta emails em HTML e CSS",
            icon: Mail,
            width: 600,
            height: 800,
            type: "email",
            categoryId: "email" // Alterado para string
        },
        {
            name: "Banner",
            description: "Exporta estáticos e banners animados em HTML, CSS e JS",
            icon: Layout,
            width: 1200,
            height: 628,
            type: "banner",
            categoryId: "banner" // Alterado para string
        },
        {
            name: "Social",
            description: "Exporta estáticos e vídeos em MP4",
            icon: Image,
            width: 1080,
            height: 1080,
            type: "social",
            categoryId: "social" // Alterado para string
        },
        {
            name: "Apresentação",
            description: "Exporta arquivos pronto para apresentação em PDF",
            icon: FileText,
            width: 1920,
            height: 1080,
            type: "presentation",
            categoryId: "presentation" // Alterado para string
        },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 border-b">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-medium">Começar um novo projeto</DialogTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="p-6">
                    <h2 className="text-xl font-medium text-center mb-8">Como deseja começar?</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {projectOptions.map((option) => (
                            <button
                                key={option.name}
                                className="flex flex-col items-center text-center p-6 border rounded-lg hover:border-purple-600 hover:bg-slate-50 transition-all"
                                onClick={() => onSelectProjectType(option)}
                            >
                                <div className="bg-slate-100 p-5 rounded-full mb-4">
                                    <option.icon className="h-8 w-8 text-slate-800" />
                                </div>
                                <h3 className="text-lg font-medium mb-2">{option.name}</h3>
                                <p className="text-gray-500 text-sm">{option.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default NewProjectDialog;
