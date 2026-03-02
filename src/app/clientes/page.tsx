import { createClient } from "@/lib/supabase/server";
import { ClientesProvider } from "@/contexts/ApiClientesContext";
import { ClientesClient } from "@/app/clientes/ClientesClient";
import { AddClientButton } from "@/components/clientes/AddClientButton";

export default async function Clientes() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const companyId = user?.app_metadata?.companyId

    const { data: clientes } = await supabase
        .from('Client')
        .select('*')
        .eq('companyId', companyId)
        .is('deletedAt', null)
        .order('createdAt', { ascending: false })

    return (
        <ClientesProvider initialData={clientes ?? []}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h1 className="text-2xl font-bold text-slate-900">Meus Clientes</h1>
                    <AddClientButton companyId={companyId} />
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <ClientesClient />
                </div>
            </div>
        </ClientesProvider>
    )
}