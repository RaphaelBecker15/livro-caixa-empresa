"use client";
import { Pencil, Trash2, Paperclip } from "lucide-react";
import { AttachmentsModal } from "@/components/empresa/AttachmentsModal";
import { useTransacoes } from "@/contexts/empresa/ApiTransacoesContext";
import { useState } from "react";

interface TransactionActionButtonsProps {
    id: string;
}

export function TransactionActionButtons({ id }: TransactionActionButtonsProps) {
    
    const { transacoes, abrirModalEditar, abrirModalExcluir } = useTransacoes()

    const [anexoAberto, setAnexoAberto] = useState<{ attachments: string[], descricao: string } | null>(null)

    const transacao = transacoes.find(u => u.id === id)

    if(!transacao) return null

    return (
        <>
            <div className="flex items-center justify-end gap-2">
                {transacao.attachments?.length > 0 && (
                    <button
                        onClick={() => setAnexoAberto({ attachments: transacao.attachments, descricao: transacao.description })}
                        className="cursor-pointer p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Ver anexos"
                    >
                        <Paperclip size={16} />
                    </button>
                )}
                <button onClick={() => abrirModalEditar(transacao)} className="cursor-pointer p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                    <Pencil size={16} />
                </button>
                <button onClick={() => abrirModalExcluir(transacao)} className="cursor-pointer p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors" title="Delete">
                    <Trash2 size={16} />
                </button>
            </div>
            
            {anexoAberto && (
                <AttachmentsModal
                    isOpen={!!anexoAberto}
                    onClose={() => setAnexoAberto(null)}
                    attachments={anexoAberto.attachments}
                    descricao={anexoAberto.descricao}
                />
            )}
        </>
    );
}