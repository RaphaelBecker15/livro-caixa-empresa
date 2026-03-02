"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { Usuario } from "@/lib/types";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type UsuariosContextType = {
    usuarios: Usuario[]
    usuarioEmEdicao: Usuario | null

    modalEditarAberto: boolean
    modalExcluirAberto: boolean

    busca: string

    abrirModalEditar: (usuario: Usuario) => void
    abrirModalExcluir: (usuario: Usuario) => void
    fecharModais: () => void
    adicionarUsuario: (usuario: Usuario) => void
    salvarEdicao: (dadosAtualizados: Usuario) => Promise<void>
    excluirUsuario: (id: string) => Promise<void>
    setBusca: (busca: string) => void
}


const ApiUsuariosContext = createContext<UsuariosContextType | undefined>(undefined)

const messages = {
    sucesso: "Ação realizada com sucesso",
    erro: "Ocorreu um erro na operação. Tente novamente mais tarde!"
}

export function UsuariosProvider({children, initialData}: {children: ReactNode, initialData: Usuario[]}) {

    const supabase = createClient()

    const router = useRouter()

    const [usuarios, setUsuarios] = useState<Usuario[]>(initialData)
    const [usuarioEmEdicao, setUsuarioEmEdicao] = useState<Usuario | null>(null)
    const [modalEditarAberto, setModalEditarAberto] = useState(false)
    const [modalExcluirAberto, setModalExcluirAberto] = useState(false)
    const [busca, setBusca] = useState('')

    const abrirModalEditar = (usuario: Usuario) => {
        setUsuarioEmEdicao(usuario)
        setModalEditarAberto(true)
    }

    const abrirModalExcluir = (usuario: Usuario) => {
        setUsuarioEmEdicao(usuario)
        setModalExcluirAberto(true)
    }

    const fecharModais = () => {
        setModalEditarAberto(false)
        setModalExcluirAberto(false)
        setUsuarioEmEdicao(null)
    }

    const adicionarUsuario = (usuario: Usuario) => {
        setUsuarios(prev => [usuario, ...prev])
    }

    const salvarEdicao = async (dadosAtualizados: Usuario) => {
        try {
            const { error } = await supabase
                .from('User')
                .update({
                    name: dadosAtualizados.name,
                    user_name: dadosAtualizados.user_name,
                    email: dadosAtualizados.email
                })
                .eq('id', dadosAtualizados.id)

            if (error) throw error

            setUsuarios(prev =>
                prev.map(u => u.id === dadosAtualizados.id ? dadosAtualizados : u)
            )
            toast.success(messages.sucesso)
            fecharModais()
            router.refresh()
        } catch {
            toast.error(messages.erro)
        }
    }

    const excluirUsuario = async (id: string) => {
        try {
            const response = await fetch('/api/excluir-usuario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error)

            setUsuarios(prev => prev.filter(u => u.id !== id))
            toast.success(messages.sucesso)
            fecharModais()
            router.refresh()
        } catch {
            toast.error(messages.erro)
        }
    }

    return (
        <ApiUsuariosContext.Provider value={{
            usuarios,
            usuarioEmEdicao,
            modalEditarAberto,
            modalExcluirAberto,
            busca,
            abrirModalEditar,
            abrirModalExcluir,
            fecharModais,
            adicionarUsuario,
            salvarEdicao,
            excluirUsuario,
            setBusca
        }}>
            {children}
        </ApiUsuariosContext.Provider>
    )
}

export function useUsuarios() {
    const context = useContext(ApiUsuariosContext)

    if(!context) {
        throw new Error("useUsuarios precisa estar dentro de UsuariosProvider")
    }

    return context
}