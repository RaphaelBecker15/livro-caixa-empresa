"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-toastify";

interface ProdutosContextType {
    produtos: Product[]
    produtoEmEdicao: Product | null
    modalEditarAberto: boolean
    modalExcluirAberto: boolean
    adicionarProduto: (produto: Product) => void
    abrirModalEditar: (produto: Product) => void
    abrirModalExcluir: (produto: Product) => void
    fecharModais: () => void
    salvarEdicao: (produto: Product) => Promise<void>
    excluirProduto: (id: string) => Promise<void>
}

const messages = {
    sucesso: "Ação realizada com sucesso",
    erro: "Ocorreu um erro na operação. Tente novamente mais tarde!"
}

const ProdutosContext = createContext<ProdutosContextType | undefined>(undefined)

export function ProdutosProvider({ children, initialData }: { children: ReactNode, initialData: Product[] }) {
    const supabase = createClient()
    const [produtos, setProdutos] = useState<Product[]>(initialData)
    const [produtoEmEdicao, setProdutoEmEdicao] = useState<Product | null>(null)
    const [modalEditarAberto, setModalEditarAberto] = useState(false)
    const [modalExcluirAberto, setModalExcluirAberto] = useState(false)

    const adicionarProduto = (produto: Product) => {
        setProdutos(prev => [produto, ...prev])
    }

    const abrirModalEditar = (produto: Product) => {
        setProdutoEmEdicao(produto)
        setModalEditarAberto(true)
    }

    const abrirModalExcluir = (produto: Product) => {
        setProdutoEmEdicao(produto)
        setModalExcluirAberto(true)
    }

    const fecharModais = () => {
        setModalEditarAberto(false)
        setModalExcluirAberto(false)
        setProdutoEmEdicao(null)
    }

    const salvarEdicao = async (produto: Product) => {
        const { error } = await supabase
            .from('Product')
            .update({
                name: produto.name,
                description: produto.description,
                price: produto.price,
            })
            .eq('id', produto.id)

        if (error) {
            toast.error(messages.erro)
            return
        }

        setProdutos(prev => prev.map(p => p.id === produto.id ? produto : p))
        toast.success(messages.sucesso)
        fecharModais()
    }

    const excluirProduto = async (id: string) => {
        const { error } = await supabase
            .from('Product')
            .update({ deletedAt: new Date().toISOString() })
            .eq('id', id)

        if (error) {
            toast.error(messages.erro)
            return
        }

        setProdutos(prev => prev.filter(p => p.id !== id))
        toast.success(messages.erro)
        fecharModais()
    }

    return (
        <ProdutosContext.Provider value={{
            produtos, produtoEmEdicao,
            modalEditarAberto, modalExcluirAberto,
            adicionarProduto, abrirModalEditar, abrirModalExcluir,
            fecharModais, salvarEdicao, excluirProduto
        }}>
            {children}
        </ProdutosContext.Provider>
    )
}

export function useProdutos() {
    const context = useContext(ProdutosContext)
    if (!context) throw new Error('useProdutos must be used within ProdutosProvider')
    return context
}