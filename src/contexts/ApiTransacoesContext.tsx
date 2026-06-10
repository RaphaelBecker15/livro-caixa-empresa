"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { Transacao } from "@/lib/types";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type TransacoesContextType = {
    transacoes: Transacao[]
    transacaoEmEdicao: Transacao | null

    modalEditarAberto: boolean
    modalExcluirAberto: boolean

    mesSelecionado: string
    setMesSelecionado: (mes: string) => void

    abrirModalEditar: (transacao: Transacao) => void
    abrirModalExcluir: (transacao: Transacao) => void
    fecharModais: () => void
    adicionarTransacao: (transacao: Transacao) => void
    salvarEdicao: (dadosAtualizados: Transacao) => Promise<void>
    excluirTransacao: (id: string, onSuccess?: () => void) => Promise<void>
}

const ApiTransacoesContext = createContext<TransacoesContextType | undefined>(undefined)

const messages = {
    sucesso: "Ação realizada com sucesso",
    erro: "Ocorreu um erro na operação. Tente novamente mais tarde!"
}

const hoje = new Date()
const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`

export function TransacoesProvider({ children, initialData  }: { children: ReactNode, initialData: Transacao[] }) {

    const supabase = createClient()
    const router = useRouter()

    const [transacoes, setTransacoes] = useState<Transacao[]>(initialData)
    const [transacaoEmEdicao, setTransacaoEmEdicao] = useState<Transacao | null>(null)
    const [modalEditarAberto, setModalEditarAberto] = useState(false)
    const [modalExcluirAberto, setModalExcluirAberto] = useState(false)
    const [mesSelecionado, setMesSelecionado] = useState(mesAtual)

    const abrirModalEditar = (transacao: Transacao) => {
        setTransacaoEmEdicao(transacao)
        setModalEditarAberto(true)
    }

    const abrirModalExcluir = (transacao: Transacao) => {
        setTransacaoEmEdicao(transacao)
        setModalExcluirAberto(true)
    }

    const fecharModais = () => {
        setModalEditarAberto(false)
        setModalExcluirAberto(false)
        setTransacaoEmEdicao(null)
    }

    const adicionarTransacao = (transacao: Transacao) => {
        setTransacoes(prev => [transacao, ...prev])
    }

    const salvarEdicao = async (dadosAtualizados: Transacao) => {
        try {
            const { error } = await supabase
                .from('Transaction')
                .update({
                    date: dadosAtualizados.date,
                    description: dadosAtualizados.description,
                    amount: dadosAtualizados.amount,
                    type: dadosAtualizados.type,
                    attachments: dadosAtualizados.attachments,
                })
                .eq('id', dadosAtualizados.id)

            if (error) throw error

            setTransacoes(prev =>
                prev.map(t => t.id === dadosAtualizados.id ? dadosAtualizados : t)
            )
            toast.success(messages.sucesso)
            fecharModais()
            router.refresh()
        } catch {
            toast.error(messages.erro)
        }
    }

    const excluirTransacao = async (id: string, onSuccess?: () => void) => {
        try {
            const transacao = transacoes.find(t => t.id === id)

            if (transacao?.attachments && transacao.attachments.length > 0) {
                await supabase.storage
                    .from('attachments')
                    .remove(transacao.attachments)
            }
            
            const { error } = await supabase
                .from('Transaction')
                .update({ deletedAt: new Date().toISOString() })
                .eq('id', id)

            if (error) throw error

            setTransacoes(prev => prev.filter(t => t.id !== id))
            toast.success(messages.sucesso)
            fecharModais()
            onSuccess?.()
            router.refresh()
        } catch {
            toast.error(messages.erro)
        }
    }

    return (
        <ApiTransacoesContext.Provider value={{
            transacoes,
            transacaoEmEdicao,
            modalEditarAberto,
            modalExcluirAberto,
            mesSelecionado,
            setMesSelecionado,
            abrirModalEditar,
            abrirModalExcluir,
            fecharModais,
            salvarEdicao,
            excluirTransacao,
            adicionarTransacao
        }}>
            {children}
        </ApiTransacoesContext.Provider>
    )
}

export function useTransacoes() {
    const context = useContext(ApiTransacoesContext)

    if(!context) {
        throw new Error("useTransacoes precisa estar dentro de TransacoesProvider")
    }

    return context
}