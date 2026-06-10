export type AuthUser = {
    id: string
    name: string
    email: string
}

export type Usuario = {
    id: string
    name: string
    user_name: string
    email: string
    active: boolean
    createdAt?: string
    updatedAt?: string
}

export type Client = {
    id: string
    userId: string
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

export type Product = {
    id: string
    userId: string
    name: string
    description?: string | null
    price: number
    deletedAt?: string | null
    createdAt?: string
    updatedAt?: string
}

export type Transacao = {
    id: string
    userId: string
    clientId?: string | null
    client?: Client | null
    productId?: string | null
    product?: Product | null
    date: string
    description: string
    amount: number
    type: 'entrada' | 'saida'
    attachments: string[]
    deletedAt?: string | null
    deletionReason?: string | null
    createdAt?: string
    updatedAt?: string
}