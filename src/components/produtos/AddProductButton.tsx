"use client";
import { useState } from "react";
import { Plus, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import { useProdutos } from "@/contexts/ApiProdutosContext";
import Modal from "@/components/Modal";

const emptyForm = {
    name: '',
    description: '',
    price: '',
}

export function AddProductButton({ userId }: { userId: string }) {
    const supabase = createClient()
    const { adicionarProduto } = useProdutos()

    const [openModal, setOpenModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState(emptyForm)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data, error } = await supabase
                .from('Product')
                .insert({
                    userId,
                    name: form.name,
                    description: form.description || null,
                    price: parseFloat(form.price),
                })
                .select()
                .single()

            if (error) throw error

            adicionarProduto(data)
            toast.success('Produto cadastrado com sucesso!')
            setOpenModal(false)
            setForm(emptyForm)
        } catch {
            toast.error('Erro ao cadastrar produto. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setOpenModal(true)}
                className="cursor-pointer bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm"
            >
                <Plus size={18} /> Novo Produto
            </button>

            <Modal isOpen={openModal} setModalOpen={() => setOpenModal(!openModal)} setTittle="Novo Produto">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nome</label>
                        <input
                            required
                            type="text"
                            value={form.name}
                            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Descrição <span className="text-slate-400 font-normal">(opcional)</span>
                        </label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Preço (R$)</label>
                        <input
                            required
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.price}
                            onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => { setOpenModal(false); setForm(emptyForm) }}
                            className="cursor-pointer px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="cursor-pointer px-6 py-2 bg-slate-900 text-white hover:bg-emerald-600 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
                        >
                            <Save size={18} /> {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    )
}