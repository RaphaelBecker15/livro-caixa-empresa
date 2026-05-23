"use client";
import { useTransacoes } from "@/contexts/ApiTransacoesContext";
import { TransactionActionButtons } from "@/components/transacoes/TransactionActionButtons";
import { EditTransacaoModal } from "@/components/transacoes/EditTransacaoModal";
import { ExcluirTransacaoModal } from "@/components/transacoes/ExcluirTransacaoModal";
import { RelatorioButton } from "@/components/transacoes/RelatorioButtonWrapper";
import { DownloadAnexosButton } from "@/components/transacoes/DownloadAnexosButton";
import { Transacao, Client, Product } from "@/lib/types";
import { useState, useMemo } from "react";
import { Eye, ChevronUp, ChevronDown, ChevronsUpDown, SlidersHorizontal, Paperclip, X } from "lucide-react";
import { ClienteInfoModal } from "@/components/ClienteInfoModal";
import { ProductInfoModal } from "@/components/ProductInfoModal";

type SortField = 'date' | 'type' | 'client' | 'amount'
type SortDir = 'asc' | 'desc'

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
    if (sortField !== field) return <ChevronsUpDown size={13} className="inline ml-1 text-slate-400" />
    return sortDir === 'asc'
        ? <ChevronUp size={13} className="inline ml-1 text-slate-700" />
        : <ChevronDown size={13} className="inline ml-1 text-slate-700" />
}

export function TransacoesClient({ clientes, produtos, nomeUsuario }: {
    clientes: Client[]
    produtos: Product[]
    nomeUsuario: string
}) {
    const { transacoes, transacaoEmEdicao, mesSelecionado, setMesSelecionado } = useTransacoes()

    const [clienteAberto, setClienteAberto] = useState<Client | null>(null)
    const [produtoAberto, setProdutoAberto] = useState<Product | null>(null)
    const [pagina, setPagina] = useState(1)
    const itensPorPagina = 10

    // Filtros
    const [tipoFiltro, setTipoFiltro] = useState<'all' | 'entrada' | 'expense'>('all')
    const [filtroCliente, setFiltroCliente] = useState<string>('all')
    const [filtroDescricao, setFiltroDescricao] = useState('')
    const [filtroAnexo, setFiltroAnexo] = useState(false)
    const [filtrosExpandidos, setFiltrosExpandidos] = useState(false)

    // Ordenação
    const [sortField, setSortField] = useState<SortField>('date')
    const [sortDir, setSortDir] = useState<SortDir>('desc')

    // Seleção para relatório
    const [selecionados, setSelecionados] = useState<string[]>([])

    const resetPagina = () => setPagina(1)

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDir('asc')
        }
        resetPagina()
    }

    const transacoesFiltradas = useMemo(() => {
        return transacoes
            .filter(tx => {
                if (!tx.date.startsWith(mesSelecionado)) return false
                if (tipoFiltro !== 'all' && tx.type !== tipoFiltro) return false
                if (filtroCliente !== 'all' && tx.clientId !== filtroCliente) return false
                if (filtroDescricao && !tx.description.toLowerCase().includes(filtroDescricao.toLowerCase())) return false
                if (filtroAnexo && (!tx.attachments || tx.attachments.length === 0)) return false
                return true
            })
            .sort((a, b) => {
                let cmp = 0
                if (sortField === 'date') cmp = a.date.localeCompare(b.date)
                else if (sortField === 'type') cmp = a.type.localeCompare(b.type)
                else if (sortField === 'amount') cmp = Number(a.amount) - Number(b.amount)
                else if (sortField === 'client') {
                    const nomeA = clientes.find(c => c.id === a.clientId)?.name ?? ''
                    const nomeB = clientes.find(c => c.id === b.clientId)?.name ?? ''
                    cmp = nomeA.localeCompare(nomeB, 'pt-BR')
                }
                return sortDir === 'asc' ? cmp : -cmp
            })
    }, [transacoes, mesSelecionado, tipoFiltro, filtroCliente, filtroDescricao, filtroAnexo, sortField, sortDir, clientes])

    const totalPaginas = Math.ceil(transacoesFiltradas.length / itensPorPagina)
    const transacoesPaginadas = transacoesFiltradas.slice(
        (pagina - 1) * itensPorPagina,
        pagina * itensPorPagina
    )

    // Seleção
    const todosSelecionados = transacoesFiltradas.length > 0 && transacoesFiltradas.every(tx => selecionados.includes(tx.id))
    const algunsSelecionados = selecionados.length > 0 && !todosSelecionados

    const toggleTodos = () => {
        if (todosSelecionados) {
            setSelecionados([])
        } else {
            setSelecionados(transacoesFiltradas.map(tx => tx.id))
        }
    }

    const toggleSelecionado = (id: string) => {
        setSelecionados(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    const handleExcluirTransacao = () => {
        const itensDaProximaPagina = transacoesFiltradas.length - 1
        const totalPaginasAposExclusao = Math.ceil(itensDaProximaPagina / itensPorPagina)
        if (pagina > totalPaginasAposExclusao) {
            setPagina(prev => Math.max(prev - 1, 1))
        }
    }

    const filtrosAtivos = tipoFiltro !== 'all' || filtroCliente !== 'all' || filtroDescricao !== '' || filtroAnexo

    const descricaoFiltros = useMemo(() => {
        const partes: string[] = []
        const mesLabel = (() => {
            const [ano, m] = mesSelecionado.split('-')
            const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
            return `${meses[parseInt(m) - 1]}/${ano}`
        })()
        partes.push(`Mês: ${mesLabel}`)
        if (tipoFiltro === 'entrada') partes.push('Tipo: Entradas')
        if (tipoFiltro === 'expense') partes.push('Tipo: Saídas')
        if (filtroCliente !== 'all') {
            const nome = clientes.find(c => c.id === filtroCliente)?.name ?? ''
            partes.push(`Cliente: ${nome}`)
        }
        if (filtroDescricao) partes.push(`Descrição: "${filtroDescricao}"`)
        if (filtroAnexo) partes.push('Com anexo')
        return partes.join(' · ')
    }, [mesSelecionado, tipoFiltro, filtroCliente, filtroDescricao, filtroAnexo, clientes])

    const limparFiltros = () => {
        setTipoFiltro('all')
        setFiltroCliente('all')
        setFiltroDescricao('')
        setFiltroAnexo(false)
        resetPagina()
    }

    return (
        <>
            {/* Toolbar principal */}
            <div className="px-2 py-2 md:px-6 md:py-3 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-800 hidden md:block">Lançamentos</h3>
                    {filtrosAtivos && (
                        <button
                            onClick={limparFiltros}
                            className="cursor-pointer flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium"
                        >
                            <X size={12} /> Limpar filtros
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                    {/* Tipo */}
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
                        <button onClick={() => { setTipoFiltro('all'); resetPagina() }} className={`cursor-pointer px-3 py-2 transition-colors ${tipoFiltro === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>Todos</button>
                        <button onClick={() => { setTipoFiltro('entrada'); resetPagina() }} className={`cursor-pointer px-3 py-2 transition-colors ${tipoFiltro === 'entrada' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>Entradas</button>
                        <button onClick={() => { setTipoFiltro('expense'); resetPagina() }} className={`cursor-pointer px-3 py-2 transition-colors ${tipoFiltro === 'expense' ? 'bg-rose-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>Saídas</button>
                    </div>
                    {/* Mês */}
                    <input
                        type="month"
                        value={mesSelecionado}
                        onChange={e => { setMesSelecionado(e.target.value); resetPagina() }}
                        className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-700 shadow-sm outline-none"
                    />
                    {/* Filtros avançados */}
                    <button
                        onClick={() => setFiltrosExpandidos(prev => !prev)}
                        className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${filtrosExpandidos || filtrosAtivos ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-gray-200 hover:bg-slate-50'}`}
                    >
                        <SlidersHorizontal size={13} />
                        Filtros
                        {filtrosAtivos && !filtrosExpandidos && (
                            <span className="bg-amber-400 text-amber-900 text-xs font-bold px-1 rounded-full leading-none py-0.5">!</span>
                        )}
                    </button>
                    {/* Relatório */}
                    <RelatorioButton
                        transacoes={transacoes}
                        transacoesFiltradas={transacoesFiltradas}
                        transacoesSelecionadas={selecionados}
                        mesSelecionado={mesSelecionado}
                        nomeUsuario={nomeUsuario}
                        clientes={clientes}
                        produtos={produtos}
                        descricaoFiltros={descricaoFiltros}
                    />
                    <DownloadAnexosButton
                        transacoesSelecionadas={selecionados}
                        transacoesFiltradas={transacoesFiltradas}
                    />
                </div>
            </div>

            {/* Filtros avançados */}
            {filtrosExpandidos && (
                <div className="px-4 md:px-6 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-3 items-end">
                    <div className="flex flex-col gap-1 min-w-[180px] flex-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Descrição</label>
                        <input
                            type="text"
                            placeholder="Buscar na descrição..."
                            value={filtroDescricao}
                            onChange={e => { setFiltroDescricao(e.target.value); resetPagina() }}
                            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                        />
                    </div>
                    <div className="flex flex-col gap-1 min-w-[160px]">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente</label>
                        <select
                            value={filtroCliente}
                            onChange={e => { setFiltroCliente(e.target.value); resetPagina() }}
                            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                        >
                            <option value="all">Todos os clientes</option>
                            <option value="">— Sem cliente</option>
                            {clientes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Anexos</label>
                        <button
                            onClick={() => { setFiltroAnexo(prev => !prev); resetPagina() }}
                            className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${filtroAnexo ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-gray-200 hover:bg-slate-50'}`}
                        >
                            <Paperclip size={14} />
                            Com anexo
                        </button>
                    </div>
                </div>
            )}

            {/* Barra de seleção */}
            {selecionados.length > 0 && (
                <div className="px-4 md:px-6 py-2 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-800">
                        {selecionados.length} lançamento(s) selecionado(s) para o relatório
                    </span>
                    <button
                        onClick={() => setSelecionados([])}
                        className="cursor-pointer text-xs text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1"
                    >
                        <X size={12} /> Limpar seleção
                    </button>
                </div>
            )}

            {/* Tabela */}
            <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[700px] text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="pl-4 pr-2 py-4 w-8">
                                <input
                                    type="checkbox"
                                    checked={todosSelecionados}
                                    ref={el => { if (el) el.indeterminate = algunsSelecionados }}
                                    onChange={toggleTodos}
                                    className="cursor-pointer rounded accent-slate-700"
                                />
                            </th>
                            <th className="px-4 py-4 font-semibold text-slate-700">
                                <button onClick={() => handleSort('date')} className="cursor-pointer flex items-center hover:text-slate-900">
                                    Data <SortIcon field="date" sortField={sortField} sortDir={sortDir} />
                                </button>
                            </th>
                            <th className="px-4 py-4 font-semibold text-slate-700">Descrição</th>
                            <th className="px-4 py-4 font-semibold text-slate-700">
                                <button onClick={() => handleSort('type')} className="cursor-pointer flex items-center hover:text-slate-900">
                                    Tipo <SortIcon field="type" sortField={sortField} sortDir={sortDir} />
                                </button>
                            </th>
                            <th className="px-4 py-4 font-semibold text-slate-700">
                                <button onClick={() => handleSort('client')} className="cursor-pointer flex items-center hover:text-slate-900">
                                    Cliente <SortIcon field="client" sortField={sortField} sortDir={sortDir} />
                                </button>
                            </th>
                            <th className="px-4 py-4 font-semibold text-slate-700">Produto</th>
                            <th className="px-4 py-4 font-semibold text-slate-700 text-right">
                                <button onClick={() => handleSort('amount')} className="cursor-pointer flex items-center ml-auto hover:text-slate-900">
                                    Valor <SortIcon field="amount" sortField={sortField} sortDir={sortDir} />
                                </button>
                            </th>
                            <th className="px-4 py-4 font-semibold text-slate-700 text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {transacoesPaginadas.length > 0 ? (
                            transacoesPaginadas.map((tx: Transacao) => {
                                const isSelecionado = selecionados.includes(tx.id)
                                const cliente = clientes.find(c => c.id === tx.clientId)
                                const produto = produtos.find(p => p.id === tx.productId)
                                return (
                                    <tr
                                        key={tx.id}
                                        className={`hover:bg-slate-50/50 transition-colors ${isSelecionado ? 'bg-amber-50/60' : ''}`}
                                    >
                                        <td className="pl-4 pr-2 py-4">
                                            <input
                                                type="checkbox"
                                                checked={isSelecionado}
                                                onChange={() => toggleSelecionado(tx.id)}
                                                className="cursor-pointer rounded accent-slate-700"
                                            />
                                        </td>
                                        <td className="px-4 py-4 font-medium text-sm whitespace-nowrap">
                                            {new Date(tx.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-4 py-4 font-medium text-sm">
                                            <div className="flex items-center gap-1.5">
                                                {tx.attachments && tx.attachments.length > 0 && (
                                                    <Paperclip size={13} className="text-slate-400 shrink-0" />
                                                )}
                                                <span>{tx.description}</span>
                                            </div>
                                        </td>
                                        <td className={`px-4 py-4 font-medium ${tx.type === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {tx.type === 'entrada' ? 'Entrada' : 'Saída'}
                                        </td>
                                        <td className="px-4 py-4 text-slate-600 font-medium text-sm">
                                            {cliente ? (
                                                <button
                                                    onClick={() => setClienteAberto(cliente)}
                                                    className="cursor-pointer flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors"
                                                >
                                                    <Eye size={14} />
                                                    <span>{cliente.name}</span>
                                                </button>
                                            ) : <span className="text-slate-300">—</span>}
                                        </td>
                                        <td className="px-4 py-4 text-slate-600 font-medium text-sm">
                                            {produto ? (
                                                <button
                                                    onClick={() => setProdutoAberto(produto)}
                                                    className="cursor-pointer flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors"
                                                >
                                                    <Eye size={14} />
                                                    <span>{produto.name}</span>
                                                </button>
                                            ) : <span className="text-slate-300">—</span>}
                                        </td>
                                        <td className={`px-4 py-4 text-right font-bold ${tx.type === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {Number(tx.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <TransactionActionButtons id={tx.id} />
                                        </td>
                                    </tr>
                                )
                            })
                        ) : (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                                    Nenhum lançamento encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
                <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs md:text-sm gap-2">
                    <span className="text-slate-500 hidden sm:block">
                        Mostrando {((pagina - 1) * itensPorPagina) + 1} a {Math.min(pagina * itensPorPagina, transacoesFiltradas.length)} de {transacoesFiltradas.length} lançamentos
                    </span>
                    <span className="text-slate-500 sm:hidden">{pagina} / {totalPaginas}</span>
                    <div className="flex items-center gap-1 md:gap-2">
                        <button onClick={() => setPagina(prev => Math.max(prev - 1, 1))} disabled={pagina === 1} className="cursor-pointer px-2 md:px-3 py-1 md:py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Anterior</button>
                        <span className="font-medium text-slate-700 hidden sm:block">{pagina} / {totalPaginas}</span>
                        <button onClick={() => setPagina(prev => Math.min(prev + 1, totalPaginas))} disabled={pagina === totalPaginas} className="cursor-pointer px-2 md:px-3 py-1 md:py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Próxima</button>
                    </div>
                </div>
            )}

            <EditTransacaoModal key={`edit-${transacaoEmEdicao?.id ?? 'novo'}`} clientes={clientes} produtos={produtos} />
            <ExcluirTransacaoModal key={`exclude-${transacaoEmEdicao?.id ?? 'novo'}`} onExcluir={handleExcluirTransacao} />
            {clienteAberto && <ClienteInfoModal cliente={clienteAberto} onClose={() => setClienteAberto(null)} />}
            {produtoAberto && <ProductInfoModal produto={produtoAberto} onClose={() => setProdutoAberto(null)} />}
        </>
    )
}