"use client";
import { X, FileText, Download, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AttachmentsModalProps {
    isOpen: boolean
    onClose: () => void
    attachments: string[]
    descricao: string
}

const getFileIcon = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext ?? '')) return <ImageIcon size={18} />
    return <FileText size={18} />
}

const getFileName = (path: string) => {
    return path.split('/').pop() ?? path
}

export function AttachmentsModal({ isOpen, onClose, attachments, descricao }: AttachmentsModalProps) {
    const supabase = createClient()

    const handleDownload = async (path: string) => {
        const { data } = await supabase.storage
            .from('attachments')
            .createSignedUrl(path, 60)

        if (data?.signedUrl) {
            window.open(data.signedUrl, '_blank')
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <h2 className="font-semibold text-slate-800">Anexos - {descricao}</h2>
                    <button onClick={onClose} className="cursor-pointer p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                        <X size={18} className="text-slate-500" />
                    </button>
                </div>
                <div className="p-6 space-y-3">
                    {attachments.length > 0 ? (
                        attachments.map((path, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3 text-slate-600 min-w-0">
                                    {getFileIcon(path)}
                                    <span className="text-sm font-medium truncate">{getFileName(path)}</span>
                                </div>
                                <button onClick={() => handleDownload(path)} className="cursor-pointer p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0 ml-2">
                                    <Download size={16} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-slate-400 py-4">Nenhum anexo encontrado.</p>
                    )}
                </div>
            </div>
        </div>
    )
}