"use client";
import { X, Package } from "lucide-react";
import { Product } from "@/lib/types";

interface ProductInfoModalProps {
    produto: Product
    onClose: () => void
}

const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function ProductInfoModal({ produto, onClose }: ProductInfoModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                            <Package size={18} />
                        </div>
                        <h2 className="font-bold text-slate-800 text-base">Detalhes do Produto</h2>
                    </div>
                    <button onClick={onClose} className="cursor-pointer p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Nome</p>
                        <p className="text-sm font-semibold text-slate-800">{produto.name}</p>
                    </div>

                    {produto.description && (
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Descrição</p>
                            <p className="text-sm text-slate-600">{produto.description}</p>
                        </div>
                    )}

                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Preço</p>
                        <p className="text-sm font-bold text-emerald-600">{formatCurrency(Number(produto.price))}</p>
                    </div>
                </div>

                <div className="px-6 pb-5">
                    <button onClick={onClose} className="cursor-pointer w-full py-2 bg-slate-900 text-white rounded-lg font-semibold text-sm hover:bg-slate-700 transition-colors">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    )
}