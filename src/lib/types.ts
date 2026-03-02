export type AuthUser = {
    id: string
    name: string
    email: string
    role: 'super_admin' | 'admin' | 'empresa'
}

export type Usuario = {
    id: string
    name: string
    user_name: string
    email: string
    role: 'super_admin' | 'admin' | 'empresa'
    active: boolean
    workspaceId: string
    companyId: string | null
}

export type Client = {
    id: string
    companyId: string
    workspaceId: string
    document: string
    documentType: 'CPF' | 'CNPJ'
    name: string
    phone?: string | null
    email?: string | null
    cep?: string | null
    logradouro?: string | null
    bairro?: string | null
    numero?: string | null
    complemento?: string | null
    municipio?: string | null
    estado?: string | null
    deletedAt?: string | null
    createdAt?: string
}

export type Transacao = {
    id: string
    date: string
    description: string
    amount: number
    type: 'income' | 'expense'
    companyId: string
    workspaceId: string
    userId: string
    attachments: string[]
    clientId?: string | null
    client?: Client | null
    deletedAt?: string | null
}

export type Empresa = {
    id: string
    name: string
    user_name: string
    email: string
    cnpj: string
    active: boolean
    workspaceId: string
}