"use client";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useEmpresas } from "@/contexts/admin/ApiEmpresasContext";
import Link from "next/link";

interface CompanyActionButtonsProps {
    id: string;
}

export function CompanyActionButtons({ id }: CompanyActionButtonsProps) {
    
    const { empresas, abrirModalEditar, abrirModalExcluir} = useEmpresas()

    const empresa = empresas.find(u => u.id === id)

    if(!empresa) return null

    return (
        <div className="flex items-center justify-end gap-2">
            <Link href={`/admin/empresas/${empresa.id}/livro-caixa`}>
                <button className="cursor-pointer p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver Livro Caixa">
                    <ExternalLink size={18} />
                </button>
            </Link>
            <button onClick={() => abrirModalEditar(empresa)} className="cursor-pointer p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                <Pencil size={18} />
            </button>
            <button onClick={() => abrirModalExcluir(empresa)} className="cursor-pointer p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Excluir">
                <Trash2 size={18} />
            </button>
        </div>
    );
}