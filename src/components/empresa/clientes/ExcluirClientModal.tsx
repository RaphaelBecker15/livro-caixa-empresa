"use client";
import { Trash2 } from "lucide-react";
import Modal from "@/components/Modal";
import { useClientes } from "@/contexts/empresa/ApiClientesContext";
import { useState } from "react";

export function ExcluirClientModal() {
    const { clienteEmEdicao, modalExcluirAberto, fecharModais, excluirCliente } = useClientes()
    const [loading, setLoading] = useState(false)

    const handleExcluir = async () => {
        if (!clienteEmEdicao) return
        setLoading(true)
        await excluirCliente(clienteEmEdicao.id)
        setLoading(false)
    }

    return (
        <Modal isOpen={modalExcluirAberto} setModalOpen={fecharModais} setTittle="Excluir Cliente">
            <div className="p-6 space-y-4">
                <p className="text-slate-600">
                    Tem certeza que deseja excluir o cliente <span className="font-bold text-slate-900">{clienteEmEdicao?.name}</span>?
                </p>
                <div className="flex justify-end gap-3">
                    <button onClick={fecharModais} className="cursor-pointer px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleExcluir} disabled={loading} className="cursor-pointer px-6 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md disabled:opacity-50">
                        <Trash2 size={18} /> {loading ? 'Excluindo...' : 'Excluir'}
                    </button>
                </div>
            </div>
        </Modal>
    )
}