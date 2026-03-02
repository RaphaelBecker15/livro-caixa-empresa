import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { name, user_name, email, password } = await request.json()

        if (!name || !user_name || !email || !password) {
            return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 })
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data: existingUser } = await supabaseAdmin
            .from('User')
            .select('id')
            .ilike('user_name', user_name.trim())
            .single()

        if (existingUser) {
            return NextResponse.json({ error: 'Nome de usuário já está em uso.' }, { status: 409 })
        }

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                name,
                user_name: user_name.trim()
            }
        })

        if (authError) {
            if (authError.message.includes('already registered')) {
                return NextResponse.json({ error: 'Este email já está cadastrado.' }, { status: 409 })
            }
            return NextResponse.json({ error: authError.message }, { status: 400 })
        }

        const { error: updateError } = await supabaseAdmin
            .from('User')
            .update({ user_name: user_name.trim() })
            .eq('id', authData.user.id)

        if (updateError) {
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
            return NextResponse.json({ error: 'Erro ao salvar usuário.' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}