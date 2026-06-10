"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Transacao {
    id: string
    date: string
    description: string
    amount: number
    type: 'entrada' | 'saida'
    clientId?: string | null
    productId?: string | null
    attachments?: string[]
}

interface Cliente {
    id: string
    name: string
}

interface Produto {
    id: string
    name: string
}

interface RelatorioButtonProps {
    transacoes: Transacao[]
    transacoesFiltradas: Transacao[]
    transacoesSelecionadas?: string[]
    mesSelecionado: string
    nomeUsuario: string
    clientes?: Cliente[]
    produtos?: Produto[]
    descricaoFiltros?: string
}

const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const formatDate = (date: string) =>
    new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')

const getMesAno = (mes: string) => {
    const [ano, month] = mes.split('-')
    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
    return `${meses[parseInt(month) - 1]} de ${ano}`
}

export function RelatorioButton({
    transacoes,
    transacoesFiltradas,
    transacoesSelecionadas = [],
    mesSelecionado,
    nomeUsuario,
    clientes = [],
    produtos = [],
    descricaoFiltros,
}: RelatorioButtonProps) {

    const [aberto, setAberto] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setAberto(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const txParaRelatorio = transacoesSelecionadas.length > 0
        ? transacoesFiltradas.filter(tx => transacoesSelecionadas.includes(tx.id))
        : transacoesFiltradas

    const calcularStats = () => {
        const saldoAcumulado = transacoes.filter(tx => tx.date.substring(0, 7) <= mesSelecionado)
        const totalEntradasAcumulado = saldoAcumulado.filter(tx => tx.type === 'entrada').reduce((acc, tx) => acc + Number(tx.amount), 0)
        const totalSaidasAcumulado = saldoAcumulado.filter(tx => tx.type === 'saida').reduce((acc, tx) => acc + Number(tx.amount), 0)
        const saldo = totalEntradasAcumulado - totalSaidasAcumulado
        const entradas = txParaRelatorio.filter(tx => tx.type === 'entrada').reduce((acc, tx) => acc + Number(tx.amount), 0)
        const saidas = txParaRelatorio.filter(tx => tx.type === 'saida').reduce((acc, tx) => acc + Number(tx.amount), 0)
        return { saldo, entradas, saidas }
    }

    const gerarPDF = async () => {
        const doc = new jsPDF()
        const { saldo, entradas, saidas } = calcularStats()
        const periodo = getMesAno(mesSelecionado)
        const pageWidth = doc.internal.pageSize.getWidth()

        // Header
        doc.setFillColor(15, 23, 42)
        doc.rect(0, 0, pageWidth, 44, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(20)
        doc.setFont('helvetica', 'bold')
        doc.text('Livro Caixa', 14, 18)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(nomeUsuario, 14, 28)
        doc.text(`Período: ${periodo}`, 14, 36)
        doc.setFontSize(8)
        doc.setTextColor(148, 163, 184)
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - 14, 36, { align: 'right' })

        let cursorY = 54

        // Filtros ativos
        if (descricaoFiltros) {
            doc.setFillColor(241, 245, 249)
            doc.rect(0, 44, pageWidth, 12, 'F')
            doc.setFontSize(7.5)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(71, 85, 105)
            doc.text(`Filtros: ${descricaoFiltros}`, 14, 52)
            cursorY = 66
        }

        // Aviso de seleção manual
        if (transacoesSelecionadas.length > 0) {
            doc.setFillColor(254, 243, 199)
            doc.rect(0, cursorY - 10, pageWidth, 10, 'F')
            doc.setFontSize(7.5)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(146, 64, 14)
            doc.text(`Relatório com ${txParaRelatorio.length} lançamento(s) selecionado(s) manualmente`, 14, cursorY - 3)
            cursorY += 2
        }

        // Cards: Entradas | Saídas | Saldo
        const cardY = cursorY
        const cardW = (pageWidth - 28 - 8) / 3

        // Card 1 — Entradas
        doc.setFillColor(240, 253, 244)
        doc.roundedRect(14, cardY, cardW, 24, 2, 2, 'F')
        doc.setTextColor(22, 163, 74)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.text('ENTRADAS DO PERÍODO', 14 + cardW / 2, cardY + 8, { align: 'center' })
        doc.setFontSize(10)
        doc.text(formatCurrency(entradas), 14 + cardW / 2, cardY + 18, { align: 'center' })

        // Card 2 — Saídas
        doc.setFillColor(255, 241, 242)
        doc.roundedRect(14 + cardW + 4, cardY, cardW, 24, 2, 2, 'F')
        doc.setTextColor(225, 29, 72)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.text('SAÍDAS DO PERÍODO', 14 + cardW + 4 + cardW / 2, cardY + 8, { align: 'center' })
        doc.setFontSize(10)
        doc.text(formatCurrency(saidas), 14 + cardW + 4 + cardW / 2, cardY + 18, { align: 'center' })

        // Card 3 — Saldo (por último)
        doc.setFillColor(239, 246, 255)
        doc.roundedRect(14 + (cardW + 4) * 2, cardY, cardW, 24, 2, 2, 'F')
        doc.setTextColor(37, 99, 235)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.text('SALDO ATUAL', 14 + (cardW + 4) * 2 + cardW / 2, cardY + 8, { align: 'center' })
        doc.setFontSize(10)
        doc.text(formatCurrency(saldo), 14 + (cardW + 4) * 2 + cardW / 2, cardY + 18, { align: 'center' })

        // Título tabela
        doc.setTextColor(15, 23, 42)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('Lançamentos', 14, cardY + 36)

        // Tabela
        autoTable(doc, {
            startY: cardY + 40,
            head: [['Data', 'Descrição', 'Tipo', 'Cliente', 'Produto', 'Valor']],
            body: txParaRelatorio.map(tx => {
                const cliente = clientes.find(c => c.id === tx.clientId)
                const produto = produtos.find(p => p.id === tx.productId)
                return [
                    formatDate(tx.date),
                    tx.description,
                    tx.type === 'entrada' ? 'Entrada' : 'Saída',
                    cliente?.name ?? '—',
                    produto?.name ?? '—',
                    formatCurrency(Number(tx.amount)),
                ]
            }),
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, halign: 'left' },
            bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: {
                0: { cellWidth: 22 },
                2: { cellWidth: 20 },
                3: { cellWidth: 36 },
                4: { cellWidth: 36 },
                5: { cellWidth: 30, halign: 'right' },
            },
            didParseCell: (data) => {
                if (data.column.index === 2 && data.section === 'body') {
                    const val = data.cell.raw as string
                    data.cell.styles.textColor = val === 'Entrada' ? [22, 163, 74] : [225, 29, 72]
                    data.cell.styles.fontStyle = 'bold'
                }
                if (data.column.index === 5 && data.section === 'body') {
                    const row = txParaRelatorio[data.row.index]
                    if (row) {
                        data.cell.styles.textColor = row.type === 'entrada' ? [22, 163, 74] : [225, 29, 72]
                        data.cell.styles.fontStyle = 'bold'
                    }
                }
                if (data.column.index === 5 && data.section === 'head') {
                    data.cell.styles.halign = 'right'
                }
            },
        })

        // Rodapé
        const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6
        doc.setDrawColor(226, 232, 240)
        doc.line(14, finalY, pageWidth - 14, finalY)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(51, 65, 85)
        doc.text(`${txParaRelatorio.length} lançamento(s)`, 14, finalY + 8)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(22, 163, 74)
        doc.text(`Entradas: ${formatCurrency(entradas)}`, pageWidth - 14 - 130, finalY + 8)
        doc.setTextColor(225, 29, 72)
        doc.text(`Saídas: ${formatCurrency(saidas)}`, pageWidth - 14 - 65, finalY + 8)
        doc.setTextColor(37, 99, 235)
        doc.setFont('helvetica', 'bold')
        doc.text(`Saldo: ${formatCurrency(entradas - saidas)}`, pageWidth - 14, finalY + 8, { align: 'right' })

        // Paginação
        const pageCount = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i)
            doc.setFontSize(8)
            doc.setTextColor(148, 163, 184)
            doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' })
        }

        doc.save(`livro-caixa-${nomeUsuario.replace(/\s/g, '_')}-${mesSelecionado}.pdf`)
        setAberto(false)
    }

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setAberto(prev => !prev)}
                className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-700 text-white text-sm font-semibold rounded-lg hover:bg-slate-600 transition-colors shadow-sm"
            >
                Relatório
                {transacoesSelecionadas.length > 0 && (
                    <span className="bg-amber-400 text-amber-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                        {transacoesSelecionadas.length}
                    </span>
                )}
                <ChevronDown size={16} className={`transition-transform ${aberto ? 'rotate-180' : ''}`} />
            </button>

            {aberto && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500">
                            {transacoesSelecionadas.length > 0
                                ? `${transacoesSelecionadas.length} selecionado(s) manualmente`
                                : `${transacoesFiltradas.length} lançamento(s) filtrado(s)`
                            }
                        </p>
                    </div>
                    <button
                        onClick={gerarPDF}
                        className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <FileText size={16} className="text-rose-500" />
                        Exportar PDF
                    </button>
                </div>
            )}
        </div>
    )
}