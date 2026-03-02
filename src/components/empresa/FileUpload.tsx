"use client";
import { UploadCloud, X, FileText, Image as ImageIcon } from "lucide-react";
import { useRef } from "react";

interface FileUploadProps {
    files: File[]
    onChange: (files: File[]) => void
}

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'text/xml', 'application/xml']
const MAX_SIZE_MB = 10

const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon size={14} />
    return <FileText size={14} />
}

export function FileUpload({ files, onChange }: FileUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFiles = (newFiles: FileList | null) => {
        if (!newFiles) return

        const valid = Array.from(newFiles).filter(file => {
            if (!ALLOWED_TYPES.includes(file.type)) {
                alert(`Tipo não permitido: ${file.name}`)
                return false
            }
            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                alert(`Arquivo muito grande (máx ${MAX_SIZE_MB}MB): ${file.name}`)
                return false
            }
            return true
        })

        onChange([...files, ...valid])
    }

    const remover = (index: number) => {
        onChange(files.filter((_, i) => i !== index))
    }

    return (
        <div className="space-y-2">
            <input
                ref={inputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.webp,.xml"
                className="hidden"
                onChange={e => handleFiles(e.target.files)}
            />
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
                className="w-full cursor-pointer border-2 border-dashed border-slate-300 rounded-md p-2 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors"
            >
                <UploadCloud size={18} className="mr-2" />
                <span className="text-sm">Clique ou arraste arquivos aqui</span>
            </div>

            {files.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs max-w-[160px]">
                            <span className="flex-shrink-0 text-slate-500">{getFileIcon(file)}</span>
                            <span className="truncate text-slate-600 text-xs flex-1">{file.name}</span>
                            <span className="text-slate-400 flex-shrink-0">({(file.size / 1024).toFixed(0)}KB)</span>
                            <button type="button" onClick={() => remover(index)} className="cursor-pointer ml-2 text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0">
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}