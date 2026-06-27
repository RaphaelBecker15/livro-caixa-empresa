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
}

export function AddTransactionButton({ userId }: AddTransactionButtonProps) {
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
        type: 'entrada',
    })

    const [files, setFiles] = useState<File[]>([])

    const handleClose = () => {
        setOpenModal(false)
        setFiles([])
        setForm({ date: dataHoje, description: '', amount: '', type: 'entrada' })
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
                })
                .select()
                .single()

                console.log('Erro detalhado:', JSON.stringify(error, null, 2))

            if (error) throw error

            adicionarTransacao(transacao)
            toast.success('Transação criada com sucesso!')
            setOpenModal(false)
            setFiles([])
            setForm({ date: dataHoje, description: '', amount: '', type: 'entrada' })
        } catch {
            if (attachmentPaths.length > 0) {
                await supabase.storage.from('attachments').remove(attachmentPaths)
            }
            toast.error('Erro ao criar transação. Tente novamente.')
            setFiles([])
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
                            <option value="entrada">Entrada</option>
                            <option value="saida">Saída</option>
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