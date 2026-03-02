"use client";
import React, { useState } from "react";
import { Plus, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useUsuarios } from "@/contexts/admin/ApiUsuariosContext";
import Modal from "@/components/Modal";

export function AddUserButton() {

    const supabase = createClient()
    const router = useRouter()
    
    const [openModal, setOpenModal] = useState(false);
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        name: '',
        user_name: '',
        email: '',
        role: 'admin',
        password: ''
    })

    const { adicionarUsuario } = useUsuarios()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            const workspaceId = user?.app_metadata?.workspaceId

            const response = await fetch('/api/criar-usuario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    user_name: form.user_name,
                    email: form.email,
                    password: form.password,
                    role: form.role,
                    workspaceId
                })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error)

            adicionarUsuario(data.usuario)
            toast.success('Usuário criado com sucesso!')
            setOpenModal(false)
            setForm({ name: '', user_name: '', email: '', role: 'admin', password: '' })
            router.refresh()
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao criar. Tente novamente.'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button onClick={() => setOpenModal(true)} className="cursor-pointer bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm">
                <Plus size={18} /> Novo Usuário
            </button>

            <Modal isOpen={openModal} setModalOpen={() => setOpenModal(!openModal)} setTittle={"Novo Usuário"}>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nome</label>
                        <input required type="text" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-black-500 outline-none transition-all"/>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Usuário</label>
                        <input required type="text" value={form.user_name} onChange={e => setForm(prev => ({ ...prev, user_name: e.target.value }))} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-black-500 outline-none transition-all"/>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                        <input required type="text" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-black-500 outline-none transition-all font-mono"/>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Senha</label>
                        <input required type="text" value={form.password} onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-black-500 outline-none transition-all font-mono"/>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Função</label>
                        <select required value={form.role} onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none">
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setOpenModal(false)} className="cursor-pointer px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancelar</button>
                        <button type="submit" className="cursor-pointer px-6 py-2 bg-slate-900 text-white hover:bg-emerald-600 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md">
                            <Save size={18}/> {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}