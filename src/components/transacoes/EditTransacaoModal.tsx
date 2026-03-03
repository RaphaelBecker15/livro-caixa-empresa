"use client";
import { Save } from "lucide-react";
import ModalTransaction from "@/components/ModalTransaction";
import { useTransacoes } from "@/contexts/ApiTransacoesContext";
import { useState } from "react";
import { Transacao } from "@/lib/types";
import { FileUpload } from "@/components/transacoes/FileUpload";
import { createClient } from "@/lib/supabase/client";
import { X, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";

interface EditTransacaoModalProps {
    clientes: { id: string, name: string, documentType: string }[]
    produtos: { id: string, name: string, price: number }[]
}

export function EditTransacaoModal({ clientes, produtos }: EditTransacaoModalProps) {

    const supabase = createClient()

    const { transacaoEmEdicao, modalEditarAberto, fecharModais, salvarEdicao } = useTransacoes()

    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        date: transacaoEmEdicao?.date ?? "",
        description: transacaoEmEdicao?.description ?? "",
        amount: transacaoEmEdicao?.amount ?? 0,
        type: transacaoEmEdicao?.type ?? "entrada",
        clientId: transacaoEmEdicao?.clientId ?? "",
        productId: transacaoEmEdicao?.productId ?? "",
    })

    const [files, setFiles] = useState<File[]>([])
    const [anexosExistentes, setAnexosExistentes] = useState<string[]>(
        transacaoEmEdicao?.attachments ?? []
    )

    const getFileName = (path: string) => path.split('/').pop() ?? path

    const removerAnexoExistente = (path: string) => {
        setAnexosExistentes(prev => prev.filter(a => a !== path))
    }

    const handleProductChange = (productId: string) => {
        const produto = produtos.find(p => p.id === productId)
        setForm(prev => ({
            ...prev,
            productId,
            amount: produto ? produto.price : prev.amount
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!transacaoEmEdicao) return
        setLoading(true)

        const novosAnexos: string[] = []

        try {
            const anexosRemovidos = transacaoEmEdicao.attachments?.filter(
                path => !anexosExistentes.includes(path)
            ) ?? []

            if (anexosRemovidos.length > 0) {
                await supabase.storage.from('attachments').remove(anexosRemovidos)
            }

            for (const file of files) {
                const ext = file.name.split('.').pop()
                const nomeBase = file.name.replace(`.${ext}`, '').replace(/[^a-zA-Z0-9._-]/g, '_')
                const path = `${transacaoEmEdicao.userId}/${nomeBase}_${Date.now()}.${ext}`

                const { error: uploadError } = await supabase.storage
                    .from('attachments')
                    .upload(path, file)

                if (uploadError) throw uploadError
                novosAnexos.push(path)
            }

            await salvarEdicao({
                ...transacaoEmEdicao,
                ...form,
                amount: parseFloat(String(form.amount)),
                clientId: form.clientId || null,
                productId: form.productId || null,
                attachments: [...anexosExistentes, ...novosAnexos]
            })
        } catch {
            if (novosAnexos.length > 0) {
                await supabase.storage.from('attachments').remove(novosAnexos)
            }
            toast.error('Erro ao salvar transação. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setFiles([])
        fecharModais()
    }

    if (!transacaoEmEdicao) return null

    return (
        <ModalTransaction isOpen={modalEditarAberto} setModalOpen={handleClose} setTittle="Editar Transação">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                    <input required type="date" value={form.date} onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))} className="cursor-pointer w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-black-500 outline-none"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                    <input required type="text" value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-black-500 outline-none"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                    <input required type="number" value={form.amount} onChange={e => setForm(prev => ({ ...prev, amount: parseFloat(e.target.value) }))} step="0.01" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-black-500 outline-none"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                    <select value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value as Transacao['type'] }))} className="cursor-pointer w-full px-3 py-2 border border-slate-300 rounded-md outline-none">
                        <option value="entrada">Entrada</option>
                        <option value="expense">Saída</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Cliente <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <select
                        value={form.clientId ?? ''}
                        onChange={e => setForm(prev => ({ ...prev, clientId: e.target.value }))}
                        className="text-slate-600 font-medium w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all bg-white"
                    >
                        <option value="">Selecione um cliente...</option>
                        {clientes.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.name} ({c.documentType})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Produto <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <select
                        value={form.productId ?? ''}
                        onChange={e => handleProductChange(e.target.value)}
                        className="text-slate-600 font-medium w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all bg-white"
                    >
                        <option value="">Selecione um produto...</option>
                        {produtos.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name} — R$ {Number(p.price).toFixed(2).replace('.', ',')}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Anexos</label>
                    {anexosExistentes.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {anexosExistentes.map((path, index) => (
                                <div key={index} className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg w-[160px] flex-shrink-0">
                                    <span className="flex-shrink-0 text-slate-500">
                                        {['jpg','jpeg','png','webp'].includes(path.split('.').pop() ?? '')
                                            ? <ImageIcon size={14} />
                                            : <FileText size={14} />
                                        }
                                    </span>
                                    <span className="truncate text-slate-600 text-xs flex-1">{getFileName(path)}</span>
                                    <button type="button" onClick={() => removerAnexoExistente(path)} className="cursor-pointer text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <FileUpload files={files} onChange={setFiles} />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                    <button type="button" onClick={handleClose} className="cursor-pointer px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancelar</button>
                    <button type="submit" disabled={loading} className="cursor-pointer px-6 py-2 bg-slate-900 text-white hover:bg-emerald-600 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md">
                        <Save size={18}/> {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </ModalTransaction>
    )
}