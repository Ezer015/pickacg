export type Subject = {
    id: number
    name: string
    nameCN: string
    rating: {
        rank: number
        total: number
        score: number
    }
    nsfw: boolean
    date?: string
    eps?: number
    tags?: {
        name: string
        count: number
    }[]
}

export type SearchResponse = {
    data: Subject[]
    total: number
}

export type SearchParam = {
    limit: number
    offset: number
}

export type SearchPayload = {
    keyword: string
    sort: string
    filter: {
        type: number[]
        air_date?: string[]
        rating?: string[]
        tags?: string[]
        rank?: string[]
    }
}
