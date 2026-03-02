"use client";
import { X, UserRound, Building2, Phone, Mail, MapPin } from "lucide-react";
import { Client } from "@/lib/types";

interface ClienteInfoModalProps {
    cliente: Client
    onClose: () => void
}

const formatDocument = (doc: string, type: 'CPF' | 'CNPJ') => {
    if (!doc) return '-'
    if (type === 'CPF') return doc.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")
    return doc.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
}

const formatCep = (cep: string) => {
    if (!cep) return '-'
    const v = cep.replace(/\D/g, '')
    if (v.length === 8) return `${v.slice(0, 5)}-${v.slice(5)}`
    cep.replace(/^(\d{5})(\d{3})$/, "$1-$2")
}

export function ClienteInfoModal({ cliente, onClose }: ClienteInfoModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" style={{ margin: 0 }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col animate-in fade-in zoom-in-95 duration-200" style={{ maxHeight: 'calc(100vh - 2rem)' }}>

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-200 rounded-lg text-slate-600">
                            {cliente.documentType === 'CPF' ? <UserRound size={20} /> : <Building2 size={20} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">{cliente.name}</h3>
                            <p className="text-xs text-slate-400">{cliente.documentType}: {formatDocument(cliente.document, cliente.documentType)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-rose-500 p-1 rounded-full hover:bg-slate-200">
                        <X size={20} />
                    </button>
                </div>

                {/* Conteúdo */}
                <div className="overflow-y-auto flex-1 p-6 space-y-4">
                    {/* Contato */}
                    {(cliente.phone || cliente.email) && (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Contato</p>
                            {cliente.phone && (
                                <div className="flex items-center gap-3 text-sm text-slate-700">
                                    <Phone size={15} className="text-slate-400" />
                                    <span>{cliente.phone}</span>
                                </div>
                            )}
                            {cliente.email && (
                                <div className="flex items-center gap-3 text-sm text-slate-700">
                                    <Mail size={15} className="text-slate-400" />
                                    <span>{cliente.email}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Endereço */}
                    {cliente.cep && (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Endereço</p>
                            <div className="flex items-start gap-3 text-sm text-slate-700">
                                <MapPin size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                <div className="space-y-0.5">
                                    <p>{cliente.logradouro}, {cliente.numero}{cliente.complemento ? ` - ${cliente.complemento}` : ''}</p>
                                    <p>{cliente.bairro}</p>
                                    <p>{cliente.municipio} - {cliente.estado}</p>
                                    <p className="font-mono text-slate-500">CEP: {formatCep(cliente.cep)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}