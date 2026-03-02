"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CriarConta() {
    const router = useRouter()

    const [form, setForm] = useState({
        name: '',
        user_name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErro('')

        if (form.password !== form.confirmPassword) {
            setErro('As senhas não coincidem.')
            return
        }

        if (form.password.length < 6) {
            setErro('A senha deve ter pelo menos 6 caracteres.')
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/criar-conta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    user_name: form.user_name,
                    email: form.email,
                    password: form.password
                })
            })

            const data = await response.json()

            if (!response.ok) {
                setErro(data.error)
                setLoading(false)
                return
            }

            router.push('/')
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
                    <h1 className="text-xl font-bold text-slate-900">Criar Conta</h1>
                    <p className="text-sm text-slate-500 mt-1">Preencha os dados para se cadastrar</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Nome completo
                        </label>
                        <input
                            required
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="João da Silva"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Nome de usuário
                        </label>
                        <input
                            required
                            name="user_name"
                            type="text"
                            value={form.user_name}
                            onChange={handleChange}
                            placeholder="joaosilva"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Email
                        </label>
                        <input
                            required
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="joao@email.com"
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
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={form.password}
                                onChange={handleChange}
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

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Confirmar senha
                        </label>
                        <div className="relative">
                            <input
                                required
                                name="confirmPassword"
                                type={showConfirm ? 'text' : 'password'}
                                value={form.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition-all pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(prev => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
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
                        <UserPlus size={18} />
                        {loading ? 'Criando conta...' : 'Criar conta'}
                    </button>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors mt-2"
                    >
                        <ArrowLeft size={15} />
                        Já tenho uma conta
                    </Link>
                </form>
            </div>
        </div>
    )
}