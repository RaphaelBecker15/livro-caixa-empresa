import { createClient } from "@/lib/supabase/server";
import { TransacoesProvider } from "@/contexts/ApiTransacoesContext";
import { AddTransactionButton } from "@/components/transacoes/AddTransactionButton";
import { TransacoesClient } from "@/app/TransacoesClient";
import { StatsCards } from "@/components/transacoes/StatsCards";
import { Client, Product } from "@/lib/types";

export default async function Dashboard() {

    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()

    const authUser = data.user
    const userId = authUser!.id

    const { data: usuario } = await supabase
        .from('User')
        .select('name')
        .eq('id', userId)
        .single()

    const { data: transacoes } = await supabase
        .from('Transaction')
        .select('*')
        .eq('userId', userId)
        .is('deletedAt', null)
        .order('date', { ascending: false })

    const { data: clientes } = await supabase
        .from('Client')
        .select('*')
        .eq('userId', userId)
        .is('deletedAt', null)
        .order('name', { ascending: true })

    const { data: produtos } = await supabase
        .from('Product')
        .select('id, name, price')
        .eq('userId', userId)
        .is('deletedAt', null)
        .order('name', { ascending: true })

    const nomeUsuario = usuario?.name ?? ''

    return (
        <TransacoesProvider initialData={transacoes ?? []}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-slate-900">Meu Livro Caixa</h1>
                    <div className="flex items-center gap-3">
                        <AddTransactionButton userId={userId} clientes={clientes ?? []} produtos={produtos ?? []} />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatsCards />
                </div>

                {/* Tabela de transações — relatório e filtros ficam dentro do TransacoesClient */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <TransacoesClient
                        clientes={(clientes ?? []) as Client[]}
                        produtos={(produtos ?? []) as Product[]}
                        nomeUsuario={nomeUsuario}
                    />
                </div>
            </div>
        </TransacoesProvider>
    )
}