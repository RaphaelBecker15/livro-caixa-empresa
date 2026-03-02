"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogIn, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Login() {

    const router = useRouter()
    const supabase = createClient()

    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErro('')

        try {
            const isEmail = identifier.includes('@')
            let email = identifier

            if (!isEmail) {
                const response = await fetch('/api/buscar-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_name: identifier })
                })

                const data = await response.json()

                if (!response.ok) {
                    setErro('Usuário não encontrado.')
                    setLoading(false)
                    return
                }

                email = data.email
            }

            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) {
                setErro('Email, usuário ou senha incorretos.')
                setLoading(false)
                return
            }

            router.push('/dashboard');

        } catch {
            setErro('Erro inesperado. Tente novamente.')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                
                {/* Header */}
                <div className="px-8 pt-8 pb-4 flex flex-col items-center">
                    <h1 className="text-xl font-bold text-slate-900">Login</h1>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="p-8 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Email/usuário
                        </label>
                        <input
                            required
                            type="text"
                            value={identifier}
                            onChange={e => setIdentifier(e.target.value)}
                            placeholder="Email/usuário"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Senha
                        </label>
                        <div className="relative">
                            <input
                                required
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition-all pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {erro && (
                        <p className="text-rose-500 text-sm font-medium">{erro}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="cursor-pointer w-full py-2.5 bg-slate-900 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <LogIn size={18} />
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>

                    <Link
                        href="/criar-conta"
                        className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors mt-2"
                    >
                        <ArrowRight size={15} />
                        Criar conta
                    </Link>
                </form>
            </div>
        </div>
    )
}
