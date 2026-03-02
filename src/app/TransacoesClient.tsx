"use client";
import { useTransacoes } from "@/contexts/empresa/ApiTransacoesContext";
import { TransactionActionButtons } from "@/components/empresa/TransactionActionButtons";
import { EditTransacaoModal } from "@/components/empresa/EditTransacaoModal";
import { ExcluirTransacaoModal } from "@/components/empresa/ExcluirTransacaoModal";
import { Transacao, Client } from "@/lib/types";
import { useState } from "react";
import { Eye } from "lucide-react";
import { ClienteInfoModal } from "@/components/ClienteInfoModal";

export function TransacoesClient({ clientes }: {
    clientes: Client[]
}) {

    const { transacoes, transacaoEmEdicao, mesSelecionado, setMesSelecionado } = useTransacoes()

    const [clienteAberto, setClienteAberto] = useState<Client | null>(null)

    const [pagina, setPagina] = useState(1)
    const itensPorPagina = 10

    const [tipoFiltro, setTipoFiltro] = useState<'all' | 'income' | 'expense'>('all')

    const transacoesFiltradas = transacoes.filter(tx => {
        const pertenceMes = tx.date.startsWith(mesSelecionado)
        const pertenceTipo = tipoFiltro === 'all' || tx.type === tipoFiltro
        return pertenceMes && pertenceTipo
    })

    const totalPaginas = Math.ceil(transacoesFiltradas.length / itensPorPagina)
    const transacoesPaginadas = transacoesFiltradas.slice(
        (pagina - 1) * itensPorPagina,
        pagina * itensPorPagina
    )
    
    const handleSetMesSelecionado = (mes: string) => {
        setPagina(1)
        setMesSelecionado(mes)
    }

    const handleSetTipoFiltro = (tipo: 'all' | 'income' | 'expense') => {
        setPagina(1)
        setTipoFiltro(tipo)
    }

    const handleExcluirTransacao = () => {
        const itensDaProximaPagina = transacoesFiltradas.length - 1
        const totalPaginasAposExclusao = Math.ceil(itensDaProximaPagina / itensPorPagina)
        if (pagina > totalPaginasAposExclusao) {
            setPagina(prev => Math.max(prev - 1, 1))
        }
    }

    return (
        <>
            <div className="px-2 py-2 md:px-6 md:py-4 border-b border-slate-200 bg-slate-50/50 flex justify-center md:justify-between items-center">
                <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-slate-800 hidden md:block">Lançamentos</h3>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
                        <button onClick={() => handleSetTipoFiltro('all')} className={`cursor-pointer px-3 py-2 transition-colors ${tipoFiltro === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                            Todos
                        </button>
                        <button onClick={() => handleSetTipoFiltro('income')} className={`cursor-pointer px-3 py-2 transition-colors ${tipoFiltro === 'income' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                            Entradas
                        </button>
                        <button onClick={() => handleSetTipoFiltro('expense')} className={`cursor-pointer px-3 py-2 transition-colors ${tipoFiltro === 'expense' ? 'bg-rose-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                            Saídas
                        </button>
                    </div>
                    <input type="month" value={mesSelecionado} onChange={e => handleSetMesSelecionado(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-700 shadow-sm outline-none transition-all" />
                </div>
            </div>
            <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[600px] text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-700">Data</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Descrição</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Tipo</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Cliente</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Valor</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {transacoesPaginadas.length > 0 ? (
                            transacoesPaginadas.map((tx: Transacao) => (
                                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-sm">{new Date(tx.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4 font-medium text-sm">{tx.description}</td>
                                    <td className={`px-6 py-4 font-medium ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {tx.type === 'income' ? 'Entrada' : 'Saída'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium text-sm">
                                        {(() => {
                                            const cliente = clientes.find(c => c.id === tx.clientId)
                                            if (!cliente) return '—'
                                            return (
                                                <button
                                                    onClick={() => setClienteAberto(cliente)}
                                                    className="cursor-pointer flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors"
                                                >
                                                    <Eye size={14} />
                                                    <span>{cliente.name}</span>
                                                </button>
                                            )
                                        })()}
                                    </td>
                                    <td className={`px-6 py-4 text-right font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {Number(tx.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <TransactionActionButtons id={tx.id} />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                    Nenhum lançamento encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {totalPaginas > 1 && (
                <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs md:text-sm gap-2">
                    <span className="text-slate-500 hidden sm:block">
                        Mostrando {((pagina - 1) * itensPorPagina) + 1} a {Math.min(pagina * itensPorPagina, transacoesFiltradas.length)} de {transacoesFiltradas.length} lançamentos
                    </span>
                    <span className="text-slate-500 sm:hidden">
                        {pagina} / {totalPaginas}
                    </span>
                    <div className="flex items-center gap-1 md:gap-2">
                        <button
                            onClick={() => setPagina(prev => Math.max(prev - 1, 1))}
                            disabled={pagina === 1}
                            className="cursor-pointer px-2 md:px-3 py-1 md:py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Anterior
                        </button>
                        <span className="font-medium text-slate-700 hidden sm:block">{pagina} / {totalPaginas}</span>
                        <button
                            onClick={() => setPagina(prev => Math.min(prev + 1, totalPaginas))}
                            disabled={pagina === totalPaginas}
                            className="cursor-pointer px-2 md:px-3 py-1 md:py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Próxima
                        </button>
                    </div>
                </div>
            )}
            <EditTransacaoModal key={`edit-${transacaoEmEdicao?.id ?? 'novo'}`} clientes={clientes}/>
            <ExcluirTransacaoModal key={`exclude-${transacaoEmEdicao?.id ?? 'novo'}`} onExcluir={handleExcluirTransacao}/>
            {clienteAberto && (
                <ClienteInfoModal
                    cliente={clienteAberto}
                    onClose={() => setClienteAberto(null)}
                />
            )}
        </>
    )
}