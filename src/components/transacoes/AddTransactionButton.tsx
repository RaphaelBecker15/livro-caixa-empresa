"use client";
import { useState } from "react";
import { Plus, Save } from "lucide-react";
import ModalTransaction from "@/components/ModalTransaction";
import { createClient } from "@/lib/supabase/client";
import { useTransacoes } from "@/contexts/ApiTransacoesContext";
import { FileUpload } from "@/components/transacoes/FileUpload"
import { toast } from "react-toastify";

interface AddTransactionButtonProps {
    userId: string
    clientes: { id: string, name: string, documentType: string, document: string }[]
    produtos: { id: string, name: string, price: number }[]
}

export function AddTransactionButton({ userId, clientes, produtos }: AddTransactionButtonProps) {
    const supabase = createClient()
    const { adicionarTransacao } = useTransacoes()

    const [openModal, setOpenModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const hoje = new Date()
    const dataHoje = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`

    const [form, setForm] = useState({
        date: dataHoje,
        description: '',
        amount: '',
        type: 'income',
        clientId: '',
        productId: '',
    })

    const [files, setFiles] = useState<File[]>([])

    const handleClose = () => {
        setOpenModal(false)
        setFiles([])
        setForm({ date: dataHoje, description: '', amount: '', type: 'income', clientId: '', productId: '' })
    }

    const handleProductChange = (productId: string) => {
        const produto = produtos.find(p => p.id === productId)
        setForm(prev => ({
            ...prev,
            productId,
            amount: produto ? produto.price.toString() : prev.amount
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const attachmentPaths: string[] = []

        try {
            for (const file of files) {
                const ext = file.name.split('.').pop()
                const nomeBase = file.name.replace(`.${ext}`, '').replace(/[^a-zA-Z0-9._-]/g, '_')
                const path = `${userId}/${nomeBase}_${Date.now()}.${ext}`
                
                const { error: uploadError } = await supabase.storage
                    .from('attachments')
                    .upload(path, file)

                if (uploadError) throw uploadError
                attachmentPaths.push(path)
            }
            
            const { data: transacao, error } = await supabase
                .from('Transaction')
                .insert({
                    date: form.date,
                    description: form.description,
                    amount: parseFloat(form.amount),
                    type: form.type,
                    userId,
                    attachments: attachmentPaths,
                    clientId: form.clientId || null,
                    productId: form.productId || null,
                })
                .select()
                .single()

            if (error) throw error

            adicionarTransacao(transacao)
            toast.success('Transação criada com sucesso!')
            setOpenModal(false)
            setForm({ date: dataHoje, description: '', amount: '', type: 'income', clientId: '', productId: '' })
        } catch {
            if (attachmentPaths.length > 0) {
                await supabase.storage.from('attachments').remove(attachmentPaths)
            }
            toast.error('Erro ao criar transação. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button onClick={() => setOpenModal(true)} className="cursor-pointer bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm shadow-emerald-200">
                <Plus size={18} /> Nova Transação
            </button>

            <ModalTransaction isOpen={openModal} setModalOpen={handleClose} setTittle="Nova Transação">
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
                        <input required type="number" step="0.01" value={form.amount} onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-black-500 outline-none"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                        <select value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))} className="cursor-pointer w-full px-3 py-2 border border-slate-300 rounded-md outline-none">
                            <option value="income">Entrada</option>
                            <option value="expense">Saída</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Cliente <span className="text-slate-400 font-normal">(opcional)</span>
                        </label>
                        <select
                            value={form.clientId}
                            onChange={e => setForm(prev => ({ ...prev, clientId: e.target.value }))}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all bg-white"
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
                            value={form.productId}
                            onChange={e => handleProductChange(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                        >
                            <option value="">Selecione um produto...</option>
                            {produtos.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} — R$ {Number(p.price).toFixed(2).replace('.', ',')}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Anexos</label>
                        <FileUpload files={files} onChange={setFiles}/>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                        <button type="button" onClick={handleClose} className="cursor-pointer px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancelar</button>
                        <button type="submit" disabled={loading} className="cursor-pointer px-6 py-2 bg-slate-900 text-white hover:bg-emerald-600 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md">
                            <Save size={18}/> {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </ModalTransaction>
        </>
    );
}