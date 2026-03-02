"use client";
import { Pencil, Trash2 } from "lucide-react";
import { useProdutos } from "@/contexts/ApiProdutosContext";
import { Product } from "@/lib/types";

export function ProductActionButtons({ produto }: { produto: Product }) {
    const { abrirModalEditar, abrirModalExcluir } = useProdutos()

    return (
        <div className="flex items-center justify-end gap-2">
            <button
                onClick={() => abrirModalEditar(produto)}
                className="cursor-pointer p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
                <Pencil size={16} />
            </button>
            <button
                onClick={() => abrirModalExcluir(produto)}
                className="cursor-pointer p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors"
            >
                <Trash2 size={16} />
            </button>
        </div>
    )
}