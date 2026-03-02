"use client";
import { useClientes } from "@/contexts/ApiClientesContext";
import { Client } from "@/lib/types";
import { UserRound, Building2 } from "lucide-react";
import { EditClientModal } from "@/components/clientes/EditClientModal";
import { ExcluirClientModal } from "@/components/clientes/ExcluirClientModal";
import { ClientActionButtons } from "@/components/clientes/ClientActionButtons";

export function ClientesClient() {
    const { clientes, clienteEmEdicao } = useClientes()

    return (
        <>
            <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[600px] text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-700">Nome/Razão Social</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">CPF/CNPJ</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Email</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Telefone</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {clientes.length > 0 ? (
                            clientes.map((cliente: Client) => (
                                <tr key={cliente.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                                {cliente.documentType === 'CPF'
                                                    ? <UserRound size={20} />
                                                    : <Building2 size={20} />
                                                }
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{cliente.name}</p>
                                                <p className="text-xs text-slate-400">{cliente.documentType}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium text-sm font-mono">
                                        {cliente.documentType === 'CNPJ'
                                            ? cliente.document.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
                                            : cliente.document.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")
                                        }
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium text-sm">{cliente.email ?? '—'}</td>
                                    <td className="px-6 py-4 text-slate-600 font-medium text-sm">{cliente.phone ?? '—'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <ClientActionButtons cliente={cliente} />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                    Nenhum cliente cadastrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <EditClientModal key={`edit-${clienteEmEdicao?.id ?? 'novo'}`} />
            <ExcluirClientModal key={`exclude-${clienteEmEdicao?.id ?? 'novo'}`} />
        </>
    )
}