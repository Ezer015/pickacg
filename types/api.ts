export type Subject = {
    id: number
    name: string
    name_cn: string
    image: string
    date?: string
    summary: string
    eps: number
    rating: {
        rank: number
        total: number
        score: number
    }
    tags: {
        name: string
        count: number
        total_cont: number
    }[]
    nsfw: boolean
}

export type SearchResponse = {
    data: Subject[]
    total: number
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
        tag?: string[]
        rank?: string[]
    }
}
