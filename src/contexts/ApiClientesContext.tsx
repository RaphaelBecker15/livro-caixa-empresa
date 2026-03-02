"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { Client } from "@/lib/types";
import { toast } from "react-toastify";

type ApiClientesContextType = {
    clientes: Client[]
    clienteEmEdicao: Client | null
    modalEditarAberto: boolean
    modalExcluirAberto: boolean
    abrirModalEditar: (cliente: Client) => void
    abrirModalExcluir: (cliente: Client) => void
    fecharModais: () => void
    adicionarCliente: (cliente: Client) => void
    salvarEdicao: (dados: Client) => Promise<void>
    excluirCliente: (id: string) => Promise<void>
}

const ApiClientesContext = createContext<ApiClientesContextType | undefined>(undefined)

export function ClientesProvider({ children, initialData }: { children: ReactNode, initialData: Client[] }) {
    const supabase = createSupabaseClient()

    const [clientes, setClientes] = useState<Client[]>(initialData)
    const [clienteEmEdicao, setClienteEmEdicao] = useState<Client | null>(null)
    const [modalEditarAberto, setModalEditarAberto] = useState(false)
    const [modalExcluirAberto, setModalExcluirAberto] = useState(false)

    const abrirModalEditar = (cliente: Client) => {
        setClienteEmEdicao(cliente)
        setModalEditarAberto(true)
    }

    const abrirModalExcluir = (cliente: Client) => {
        setClienteEmEdicao(cliente)
        setModalExcluirAberto(true)
    }

    const fecharModais = () => {
        setClienteEmEdicao(null)
        setModalEditarAberto(false)
        setModalExcluirAberto(false)
    }

    const adicionarCliente = (cliente: Client) => {
        setClientes(prev => [cliente, ...prev])
    }

    const salvarEdicao = async (dados: Client) => {
        const { error } = await supabase
            .from('Client')
            .update({
                document: dados.document,
                documentType: dados.documentType,
                name: dados.name,
                phone: dados.phone || null,
                email: dados.email || null,
                cep: dados.cep || null,
                logradouro: dados.logradouro || null,
                bairro: dados.bairro || null,
                numero: dados.numero || null,
                complemento: dados.complemento || null,
                municipio: dados.municipio || null,
                estado: dados.estado || null,
            })
            .eq('id', dados.id)

        if (error) {
            toast.error('Erro ao salvar cliente.')
            return
        }

        setClientes(prev => prev.map(c => c.id === dados.id ? { ...c, ...dados } : c))
        toast.success('Cliente atualizado com sucesso!')
        fecharModais()
    }

    const excluirCliente = async (id: string) => {
        const { error } = await supabase
            .from('Client')
            .update({ deletedAt: new Date().toISOString() })
            .eq('id', id)

        if (error) {
            toast.error('Erro ao excluir cliente.')
            return
        }

        setClientes(prev => prev.filter(c => c.id !== id))
        toast.success('Cliente excluído com sucesso!')
        fecharModais()
    }

    return (
        <ApiClientesContext.Provider value={{
            clientes,
            clienteEmEdicao,
            modalEditarAberto,
            modalExcluirAberto,
            abrirModalEditar,
            abrirModalExcluir,
            fecharModais,
            adicionarCliente,
            salvarEdicao,
            excluirCliente
        }}>
            {children}
        </ApiClientesContext.Provider>
    )
}

export function useClientes() {
    const context = useContext(ApiClientesContext)
    if (!context) throw new Error('useClientes must be used within ClientesProvider')
    return context
}