"use client";
import { useState } from "react";
import { Save } from "lucide-react";
import Modal from "@/components/Modal";
import { useProdutos } from "@/contexts/ApiProdutosContext";

export function EditProductModal() {
    const { produtoEmEdicao, modalEditarAberto, fecharModais, salvarEdicao } = useProdutos()
    const [loading, setLoading] = useState(false)

    const [form, setForm] = useState({
        name: produtoEmEdicao?.name ?? '',
        description: produtoEmEdicao?.description ?? '',
        price: produtoEmEdicao?.price?.toString() ?? '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!produtoEmEdicao) return
        setLoading(true)
        await salvarEdicao({
            ...produtoEmEdicao,
            name: form.name,
            description: form.description || null,
            price: parseFloat(form.price),
        })
        setLoading(false)
    }

    if (!produtoEmEdicao) return null

    return (
        <Modal isOpen={modalEditarAberto} setModalOpen={fecharModais} setTittle="Editar Produto">
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nome</label>
                    <input
                        required
                        type="text"
                        value={form.name}
                        onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                        className="text-slate-600 font-medium w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Descrição <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <textarea
                        value={form.description ?? ''}
                        onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="text-slate-600 font-medium w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all resize-none"
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
                        className="text-slate-600 font-medium w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all"
                    />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={fecharModais}
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
    )
}