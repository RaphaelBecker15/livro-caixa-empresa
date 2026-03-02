import { createClient } from "@/lib/supabase/server";
import { ProdutosProvider } from "@/contexts/ApiProdutosContext";
import { ProdutosClient } from "@/app/produtos/ProdutosClient";
import { AddProductButton } from "@/components/produtos/AddProductButton";

export default async function Produtos() {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    const userId = data.user!.id

    const { data: produtos } = await supabase
        .from('Product')
        .select('*')
        .eq('userId', userId)
        .is('deletedAt', null)
        .order('createdAt', { ascending: false })

    return (
        <ProdutosProvider initialData={produtos ?? []}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h1 className="text-2xl font-bold text-slate-900">Meus Produtos</h1>
                    <AddProductButton userId={userId} />
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <ProdutosClient />
                </div>
            </div>
        </ProdutosProvider>
    )
}