"use client";
import { useState } from "react";
import { Save } from "lucide-react";
import Modal from "@/components/Modal";
import { useClientes } from "@/contexts/ApiClientesContext";

const estadosBR = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const formatDocument = (value: string, type: 'CPF' | 'CNPJ') => {
    const v = value.replace(/\D/g, '')
    if (type === 'CPF') {
        if (v.length <= 3) return v
        if (v.length <= 6) return `${v.slice(0,3)}.${v.slice(3)}`
        if (v.length <= 9) return `${v.slice(0,3)}.${v.slice(3,6)}.${v.slice(6)}`
        return `${v.slice(0,3)}.${v.slice(3,6)}.${v.slice(6,9)}-${v.slice(9,11)}`
    } else {
        if (v.length <= 2) return v
        if (v.length <= 5) return `${v.slice(0,2)}.${v.slice(2)}`
        if (v.length <= 8) return `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5)}`
        if (v.length <= 12) return `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5,8)}/${v.slice(8)}`
        return `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5,8)}/${v.slice(8,12)}-${v.slice(12,14)}`
    }
}

const formatPhone = (value: string) => {
    const v = value.replace(/\D/g, '')
    if (v.length <= 2) return `+${v}`
    if (v.length <= 4) return `+${v.slice(0,2)} (${v.slice(2)}`
    if (v.length <= 9) return `+${v.slice(0,2)} (${v.slice(2,4)}) ${v.slice(4)}`
    return `+${v.slice(0,2)} (${v.slice(2,4)}) ${v.slice(4,9)}-${v.slice(9,13)}`
}

const formatCep = (value: string) => {
    const v = value.replace(/\D/g, '')
    if (v.length <= 5) return v
    return `${v.slice(0,5)}-${v.slice(5,8)}`
}

export function EditClientModal() {
    const { clienteEmEdicao, modalEditarAberto, fecharModais, salvarEdicao } = useClientes()
    const [loading, setLoading] = useState(false)
    const [loadingCep, setLoadingCep] = useState(false)

    const docFormatado = clienteEmEdicao ? formatDocument(clienteEmEdicao.document, clienteEmEdicao.documentType) : ''
    const cepFormatado = clienteEmEdicao?.cep ? formatCep(clienteEmEdicao.cep) : ''

    const [form, setForm] = useState({
        document: docFormatado,
        documentType: clienteEmEdicao?.documentType ?? 'CNPJ' as 'CPF' | 'CNPJ',
        name: clienteEmEdicao?.name ?? '',
        phone: clienteEmEdicao?.phone ?? '',
        email: clienteEmEdicao?.email ?? '',
        hasAddress: !!(clienteEmEdicao?.cep),
        cep: cepFormatado,
        logradouro: clienteEmEdicao?.logradouro ?? '',
        bairro: clienteEmEdicao?.bairro ?? '',
        numero: clienteEmEdicao?.numero ?? '',
        complemento: clienteEmEdicao?.complemento ?? '',
        municipio: clienteEmEdicao?.municipio ?? '',
        estado: clienteEmEdicao?.estado ?? '',
    })

    const buscarCep = async (cep: string) => {
        const cepLimpo = cep.replace(/\D/g, '')
        if (cepLimpo.length !== 8) return
        setLoadingCep(true)
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
            const data = await res.json()
            if (!data.erro) {
                setForm(prev => ({
                    ...prev,
                    logradouro: data.logradouro ?? '',
                    bairro: data.bairro ?? '',
                    municipio: data.localidade ?? '',
                    estado: data.uf ?? '',
                }))
            }
        } catch {
            // silencioso
        } finally {
            setLoadingCep(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!clienteEmEdicao) return
        setLoading(true)
        await salvarEdicao({
            ...clienteEmEdicao,
            document: form.document.replace(/\D/g, ''),
            documentType: form.documentType,
            name: form.name,
            phone: form.phone || null,
            email: form.email || null,
            cep: form.hasAddress ? form.cep.replace(/\D/g, '') : null,
            logradouro: form.hasAddress ? form.logradouro : null,
            bairro: form.hasAddress ? form.bairro : null,
            numero: form.hasAddress ? form.numero : null,
            complemento: form.hasAddress ? form.complemento || null : null,
            municipio: form.hasAddress ? form.municipio : null,
            estado: form.hasAddress ? form.estado : null,
        })
        setLoading(false)
    }

    if (!clienteEmEdicao) return null

    return (
        <Modal isOpen={modalEditarAberto} setModalOpen={fecharModais} setTittle="Editar Cliente">
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">

                {/* Tipo */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo</label>
                    <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm font-semibold w-fit">
                        <button type="button" onClick={() => setForm(prev => ({ ...prev, documentType: 'CNPJ', document: '' }))}
                            className={`cursor-pointer px-4 py-2 transition-colors ${form.documentType === 'CNPJ' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                            PJ (CNPJ)
                        </button>
                        <button type="button" onClick={() => setForm(prev => ({ ...prev, documentType: 'CPF', document: '' }))}
                            className={`cursor-pointer px-4 py-2 transition-colors ${form.documentType === 'CPF' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                            PF (CPF)
                        </button>
                    </div>
                </div>

                {/* Documento */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">{form.documentType}</label>
                    <input required type="text" value={form.document}
                        onChange={e => setForm(prev => ({ ...prev, document: formatDocument(e.target.value, prev.documentType) }))}
                        placeholder={form.documentType === 'CNPJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                        maxLength={form.documentType === 'CNPJ' ? 18 : 14}
                        className="text-slate-600 font-medium w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all font-mono" />
                </div>

                {/* Nome */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                        {form.documentType === 'CNPJ' ? 'Razão Social' : 'Nome'}
                    </label>
                    <input required type="text" value={form.name}
                        onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                        className="text-slate-600 font-medium w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all" />
                </div>

                {/* Telefone */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Telefone <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <input type="text" value={form.phone}
                        onChange={e => setForm(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
                        placeholder="+55 (00) 00000-0000"
                        maxLength={19}
                        className="text-slate-600 font-medium w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all font-mono" />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Email <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <input type="email" value={form.email}
                        onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                        className="text-slate-600 font-medium w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all" />
                </div>

                {/* Endereço toggle */}
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="hasAddressEdit" checked={form.hasAddress}
                        onChange={e => setForm(prev => ({ ...prev, hasAddress: e.target.checked }))}
                        className="w-4 h-4 accent-slate-900 cursor-pointer" />
                    <label htmlFor="hasAddressEdit" className="text-sm font-semibold text-slate-700 cursor-pointer">
                        Informar endereço
                    </label>
                </div>

                {form.hasAddress && (
                    <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">CEP</label>
                                <input required type="text" value={form.cep}
                                    onChange={e => {
                                        const formatted = formatCep(e.target.value)
                                        setForm(prev => ({ ...prev, cep: formatted }))
                                        if (formatted.replace(/\D/g, '').length === 8) buscarCep(formatted)
                                    }}
                                    placeholder="00000-000"
                                    maxLength={9}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all font-mono" />
                                {loadingCep && <p className="text-xs text-slate-400 mt-1">Buscando CEP...</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Número</label>
                                <input required type="text" value={form.numero}
                                    onChange={e => setForm(prev => ({ ...prev, numero: e.target.value }))}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Logradouro</label>
                            <input required type="text" value={form.logradouro}
                                onChange={e => setForm(prev => ({ ...prev, logradouro: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Bairro</label>
                            <input required type="text" value={form.bairro}
                                onChange={e => setForm(prev => ({ ...prev, bairro: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Município</label>
                                <input required type="text" value={form.municipio}
                                    onChange={e => setForm(prev => ({ ...prev, municipio: e.target.value }))}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Estado</label>
                                <select required value={form.estado}
                                    onChange={e => setForm(prev => ({ ...prev, estado: e.target.value }))}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all bg-white">
                                    <option value="">Selecione</option>
                                    {estadosBR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Complemento <span className="text-slate-400 font-normal">(opcional)</span>
                            </label>
                            <input type="text" value={form.complemento}
                                onChange={e => setForm(prev => ({ ...prev, complemento: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none transition-all" />
                        </div>
                    </div>
                )}

                <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={fecharModais}
                        className="cursor-pointer px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" disabled={loading}
                        className="cursor-pointer px-6 py-2 bg-slate-900 text-white hover:bg-emerald-600 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md disabled:opacity-50">
                        <Save size={18} /> {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}