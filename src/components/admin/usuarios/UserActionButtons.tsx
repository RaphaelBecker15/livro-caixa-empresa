"use client";
import { Pencil, Trash2 } from "lucide-react";
import { useUsuarios } from "@/contexts/admin/ApiUsuariosContext";
import { useAuth } from "@/contexts/AuthContext";

interface UserActionButtonsProps {
    id: string;
}

export function UserActionButtons({ id }: UserActionButtonsProps) {

    const { usuarios, abrirModalEditar, abrirModalExcluir } = useUsuarios()

    const { user } = useAuth()

    const usuario = usuarios.find(u => u.id === id)

    if (!usuario) return null

    if (usuario.companyId) return null

    if (usuario.id === user?.id) {
        return (
            <div className="flex items-center justify-end gap-2">
                <button onClick={() => abrirModalEditar(usuario)} className="cursor-pointer p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                    <Pencil size={18} />
                </button>
            </div>
        )
    } else {
        return (
            <>
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => abrirModalEditar(usuario)} className="cursor-pointer p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                        <Pencil size={18} />
                    </button>
                    <button onClick={() => abrirModalExcluir(usuario)} className="cursor-pointer p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Excluir">
                        <Trash2 size={18} />
                    </button>
                </div>
            </>
        );
    }
}