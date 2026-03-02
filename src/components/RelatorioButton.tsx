"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Transacao {
    date: string
    description: string
    amount: number
    type: 'income' | 'expense'
}

interface RelatorioButtonProps {
    transacoes: Transacao[]
    transacoesFiltradas: Transacao[]
    mesSelecionado: string
    nomeEmpresa: string
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

export function RelatorioButton({ transacoes, transacoesFiltradas, mesSelecionado, nomeEmpresa }: RelatorioButtonProps) {

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

    const calcularStats = () => {
        const saldoAcumulado = transacoes.filter(tx => tx.date.substring(0, 7) <= mesSelecionado)
        const totalEntradasAcumulado = saldoAcumulado.filter(tx => tx.type === 'income').reduce((acc, tx) => acc + Number(tx.amount), 0)
        const totalSaidasAcumulado = saldoAcumulado.filter(tx => tx.type === 'expense').reduce((acc, tx) => acc + Number(tx.amount), 0)
        const saldo = totalEntradasAcumulado - totalSaidasAcumulado
        const entradas = transacoesFiltradas.filter(tx => tx.type === 'income').reduce((acc, tx) => acc + Number(tx.amount), 0)
        const saidas = transacoesFiltradas.filter(tx => tx.type === 'expense').reduce((acc, tx) => acc + Number(tx.amount), 0)
        return { saldo, entradas, saidas }
    }

    const gerarPDF = async () => {
        const doc = new jsPDF()
        const { saldo, entradas, saidas } = calcularStats()
        const periodo = getMesAno(mesSelecionado)
        const pageWidth = doc.internal.pageSize.getWidth()

        // Header
        doc.setFillColor(15, 23, 42)
        doc.rect(0, 0, pageWidth, 42, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(20)
        doc.setFont('helvetica', 'bold')
        doc.text('Livro Caixa', 14, 18)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(nomeEmpresa, 14, 28)
        doc.text(`Período: ${periodo}`, 14, 35)
        doc.setFontSize(8)
        doc.setTextColor(148, 163, 184)
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - 14, 35, { align: 'right' })

        // Logo
        const logoImg = new Image()
        logoImg.src = '/logo-grupo-rezende.png'
        await new Promise(resolve => { logoImg.onload = resolve })

        const maxH = 20
        const maxW = 80
        const ratio = logoImg.naturalWidth / logoImg.naturalHeight
        const logoH = maxH
        const logoW = Math.min(logoH * ratio, maxW)

        doc.addImage(logoImg, 'PNG', pageWidth - 14 - logoW, 6, logoW, logoH)

        // Cards do topo
        const cardY = 52
        const cardW = (pageWidth - 28 - 8) / 3

        doc.setFillColor(239, 246, 255)
        doc.roundedRect(14, cardY, cardW, 24, 2, 2, 'F')
        doc.setTextColor(37, 99, 235)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.text('SALDO ATUAL', 14 + cardW / 2, cardY + 8, { align: 'center' })
        doc.setFontSize(10)
        doc.text(formatCurrency(saldo), 14 + cardW / 2, cardY + 18, { align: 'center' })

        doc.setFillColor(240, 253, 244)
        doc.roundedRect(14 + cardW + 4, cardY, cardW, 24, 2, 2, 'F')
        doc.setTextColor(22, 163, 74)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.text('ENTRADAS DO PERÍODO', 14 + cardW + 4 + cardW / 2, cardY + 8, { align: 'center' })
        doc.setFontSize(10)
        doc.text(formatCurrency(entradas), 14 + cardW + 4 + cardW / 2, cardY + 18, { align: 'center' })

        doc.setFillColor(255, 241, 242)
        doc.roundedRect(14 + (cardW + 4) * 2, cardY, cardW, 24, 2, 2, 'F')
        doc.setTextColor(225, 29, 72)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.text('SAÍDAS DO PERÍODO', 14 + (cardW + 4) * 2 + cardW / 2, cardY + 8, { align: 'center' })
        doc.setFontSize(10)
        doc.text(formatCurrency(saidas), 14 + (cardW + 4) * 2 + cardW / 2, cardY + 18, { align: 'center' })

        // Título tabela
        doc.setTextColor(15, 23, 42)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('Lançamentos', 14, cardY + 36)

        // Tabela
        autoTable(doc, {
            startY: cardY + 40,
            head: [['Data', 'Descrição', 'Tipo', 'Valor']],
            body: transacoesFiltradas.map(tx => [
                formatDate(tx.date),
                tx.description,
                tx.type === 'income' ? 'Entrada' : 'Saída',
                formatCurrency(Number(tx.amount))
            ]),
            headStyles: {
                fillColor: [15, 23, 42],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 9,
                halign: 'left'
            },
            bodyStyles: {
                fontSize: 9,
                textColor: [51, 65, 85],
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252],
            },
            columnStyles: {
                0: { cellWidth: 25 },
                2: { cellWidth: 25 },
                3: { cellWidth: 35, halign: 'right' },
            },
            didParseCell: (data) => {
                if (data.column.index === 2 && data.section === 'body') {
                    const val = data.cell.raw as string
                    data.cell.styles.textColor = val === 'Entrada' ? [22, 163, 74] : [225, 29, 72]
                    data.cell.styles.fontStyle = 'bold'
                }
                if (data.column.index === 3 && data.section === 'body') {
                    const row = transacoesFiltradas[data.row.index]
                    if (row) {
                        data.cell.styles.textColor = row.type === 'income' ? [22, 163, 74] : [225, 29, 72]
                        data.cell.styles.fontStyle = 'bold'
                    }
                }
                if (data.column.index === 3 && data.section === 'head') {
                    data.cell.styles.halign = 'right'
                }
            },
        })

        // Rodapé da tabela
        const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6
        doc.setDrawColor(226, 232, 240)
        doc.line(14, finalY, pageWidth - 14, finalY)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(51, 65, 85)
        doc.text(`${transacoesFiltradas.length} lançamento(s) no período`, 14, finalY + 8)

        // Paginação
        const pageCount = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i)
            doc.setFontSize(8)
            doc.setTextColor(148, 163, 184)
            doc.text(
                `Página ${i} de ${pageCount}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 8,
                { align: 'center' }
            )
        }

        doc.save(`livro-caixa-${nomeEmpresa.replace(/\s/g, '_')}-${mesSelecionado}.pdf`)
        setAberto(false)
    }

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setAberto(prev => !prev)}
                className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-700 text-white text-sm font-semibold rounded-lg hover:bg-slate-600 transition-colors shadow-sm"
            >
                Gerar Relatório
                <ChevronDown size={16} className={`transition-transform ${aberto ? 'rotate-180' : ''}`} />
            </button>

            {aberto && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
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