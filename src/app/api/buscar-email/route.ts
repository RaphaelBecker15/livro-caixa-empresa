import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { user_name } = await request.json()

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data: user, error } = await supabaseAdmin
            .from('User')
            .select('email')
            .ilike('user_name', user_name.trim())
            .single()

        if (error || !user) {
            return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
        }

        return NextResponse.json({ email: user.email })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}