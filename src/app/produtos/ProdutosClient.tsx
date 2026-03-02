"use client";
import { useProdutos } from "@/contexts/ApiProdutosContext";
import { Product } from "@/lib/types";
import { Package } from "lucide-react";
import { EditProductModal } from "@/components/produtos/EditProductModal";
import { ExcluirProductModal } from "@/components/produtos/ExcluirProductModal";
import { ProductActionButtons } from "@/components/produtos/ProductActionButtons";

const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function ProdutosClient() {
    const { produtos, produtoEmEdicao } = useProdutos()

    return (
        <>
            <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[500px] text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-700">Produto</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Descrição</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Preço</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {produtos.length > 0 ? (
                            produtos.map((produto: Product) => (
                                <tr key={produto.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                                <Package size={20} />
                                            </div>
                                            <p className="font-medium text-sm">{produto.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">
                                        {produto.description ?? <span className="text-slate-300">—</span>}
                                    </td>
                                    <td className="px-6 py-4 text-slate-700 font-semibold text-sm">
                                        {formatCurrency(Number(produto.price))}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <ProductActionButtons produto={produto} />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                    Nenhum produto cadastrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <EditProductModal key={`edit-${produtoEmEdicao?.id ?? 'novo'}`} />
            <ExcluirProductModal key={`exclude-${produtoEmEdicao?.id ?? 'novo'}`} />
        </>
    )
}