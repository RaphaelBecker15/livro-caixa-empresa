"use client";
import { useTransacoes } from "@/contexts/empresa/ApiTransacoesContext"
import { RelatorioButton } from "@/components/RelatorioButton"

interface Props {
    nomeEmpresa: string
}

export function RelatorioButtonWrapper({ nomeEmpresa }: Props) {
    const { transacoes, mesSelecionado } = useTransacoes()

    const transacoesFiltradas = transacoes.filter(tx =>
        tx.date.startsWith(mesSelecionado)
    )

    return (
        <RelatorioButton
            transacoes={transacoes}
            transacoesFiltradas={transacoesFiltradas}
            mesSelecionado={mesSelecionado}
            nomeEmpresa={nomeEmpresa}
        />
    )
}