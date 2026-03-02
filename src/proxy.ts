import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rotasPermitidas: Record<string, string[]> = {
    '/dashboard': ['admin'],
    '/clientes': ['admin'],
}

export async function proxy(request: NextRequest) {
    const response = NextResponse.next()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                }
            }
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const role = user?.app_metadata?.role

    if (!user) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    const pathname = request.nextUrl.pathname

    const rotaProtegida = Object.keys(rotasPermitidas).find(rota =>
        pathname.startsWith(rota)
    )

    if (rotaProtegida && (!role || !rotasPermitidas[rotaProtegida].includes(role))) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return response
}

export const config = {
    matcher: ['/:path*']
}