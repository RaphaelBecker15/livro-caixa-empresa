"use client";
import { Save } from "lucide-react";
import Modal from "@/components/Modal";
import { useUsuarios } from "@/contexts/admin/ApiUsuariosContext";
import { useState } from "react";

export function EditUserModal() {

    const { usuarioEmEdicao, modalEditarAberto, fecharModais, salvarEdicao } = useUsuarios();

    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        name: usuarioEmEdicao?.name ?? "",
        user_name: usuarioEmEdicao?.user_name ?? "",
        email: usuarioEmEdicao?.email ?? "",
        role: usuarioEmEdicao?.role ?? "admin"
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!usuarioEmEdicao) return

        setLoading(true)
        await salvarEdicao({
            ...usuarioEmEdicao,
            ...form
        })
        setLoading(false)
    }

    if(!usuarioEmEdicao) return null

    return (
        <Modal isOpen={modalEditarAberto} setModalOpen={fecharModais} setTittle="Editar Usuário" >
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nome</label>
                    <input required type="text" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} className="text-slate-600 font-medium w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-black-500 outline-none transition-all"/>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Usuário</label>
                    <input required type="text" value={form.user_name} onChange={e => setForm(prev => ({ ...prev, user_name: e.target.value }))} className="text-slate-600 font-medium w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-black-500 outline-none transition-all" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                    <input required type="text" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} className="text-slate-600 font-medium w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-black-500 outline-none transition-all"/>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={fecharModais} className="cursor-pointer px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancelar</button>
                    <button type="submit" className="cursor-pointer px-6 py-2 bg-slate-900 text-white hover:bg-emerald-600 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md">
                        <Save size={18}/> {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}