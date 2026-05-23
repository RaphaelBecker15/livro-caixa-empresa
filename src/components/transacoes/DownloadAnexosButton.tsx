"use client";
import { useState } from "react";
import { Archive } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import JSZip from "jszip";

interface Transacao {
    id: string
    description: string
    date: string
    attachments: string[]
}

interface Props {
    transacoesSelecionadas: string[]
    transacoesFiltradas: Transacao[]
}

export function DownloadAnexosButton({ transacoesSelecionadas, transacoesFiltradas }: Props) {
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const txComAnexo = (
        transacoesSelecionadas.length > 0
            ? transacoesFiltradas.filter(tx => transacoesSelecionadas.includes(tx.id))
            : transacoesFiltradas
    ).filter(tx => tx.attachments && tx.attachments.length > 0)

    if (txComAnexo.length === 0) return null

    const totalAnexos = txComAnexo.reduce((acc, tx) => acc + tx.attachments.length, 0)

    const handleDownload = async () => {
        setLoading(true)
        try {
            const zip = new JSZip()

            for (const tx of txComAnexo) {
                const pasta = zip.folder(
                    `${tx.date}_${tx.description.replace(/[^a-zA-Z0-9\s]/g, '').trim().slice(0, 40)}`
                )
                if (!pasta) continue

                for (const path of tx.attachments) {
                    const { data, error } = await supabase.storage
                        .from('attachments')
                        .download(path)

                    if (error || !data) continue

                    const nomeArquivo = path.split('/').pop() ?? path
                    pasta.file(nomeArquivo, data)
                }
            }

            const blob = await zip.generateAsync({ type: 'blob' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `anexos-${new Date().toISOString().slice(0, 10)}.zip`
            a.click()
            URL.revokeObjectURL(url)
        } catch (e) {
            console.error('Erro ao gerar zip:', e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDownload}
            disabled={loading}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Archive size={15} />
            {loading
                ? 'Gerando ZIP...'
                : `Baixar Anexos (${totalAnexos})`
            }
        </button>
    )
}