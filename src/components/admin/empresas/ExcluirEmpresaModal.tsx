"use client";
import Modal from "@/components/Modal";
import { useEmpresas } from "@/contexts/admin/ApiEmpresasContext";
import { useState } from "react";

export function ExcluirEmpresaModal() {

    const { empresaEmEdicao, modalExcluirAberto, fecharModais, excluirEmpresa } = useEmpresas();
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!empresaEmEdicao) return

        setLoading(true)
        await excluirEmpresa(empresaEmEdicao.id)
        setLoading(false)
    }

    if(!empresaEmEdicao) return null

    return (
        <Modal isOpen={modalExcluirAberto} setModalOpen={fecharModais} setTittle="Excluir Empresa" >
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
                <h1 className="text-base text-slate-800">Tem certeza que quer excluir a Empresa <strong>{empresaEmEdicao.name}?</strong></h1>
                <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={fecharModais} className="cursor-pointer px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancelar</button>
                    <button type='submit' disabled={loading} className='cursor-pointer px-6 py-2 bg-red-600 text-white hover:bg-red-500 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md'>{loading ? 'Excluindo...' : 'Sim'}</button>
                </div>
            </form>
        </Modal>
    )
}