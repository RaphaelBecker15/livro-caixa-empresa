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

export type Transacao = {
    id: string
    userId: string
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