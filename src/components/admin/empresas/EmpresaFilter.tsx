"use client";
import { Search } from "lucide-react";
import { useEmpresas } from "@/contexts/admin/ApiEmpresasContext";

export function EmpresaFilter() {

    const { empresas, busca, setBusca } = useEmpresas();

    return (
        <>
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome ou CNPJ..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-black-500 outline-none"/>
            </div>
            <div className="text-sm text-slate-500 whitespace-nowrap">
                Total: <span className="font-bold text-slate-900">{empresas.length}</span> empresa(s)
            </div>
        </>
    )
}