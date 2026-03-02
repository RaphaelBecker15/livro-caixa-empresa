"use client";
import { useTransacoes } from "@/contexts/ApiTransacoesContext"
import { RelatorioButton } from "@/components/RelatorioButton"

interface Props {
    nomeUsuario: string
}

export function RelatorioButtonWrapper({ nomeUsuario }: Props) {
    const { transacoes, mesSelecionado } = useTransacoes()

    const transacoesFiltradas = transacoes.filter(tx =>
        tx.date.startsWith(mesSelecionado)
    )

    return (
        <RelatorioButton
            transacoes={transacoes}
            transacoesFiltradas={transacoesFiltradas}
            mesSelecionado={mesSelecionado}
            nomeUsuario={nomeUsuario}
        />
    )
}