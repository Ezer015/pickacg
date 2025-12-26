export type Subject = {
    id: number
    name: string
    nameCN: string
    rating: {
        rank: number
        total: number
        score: number
    }
    images?: {
        large: string
        medium: string
        common: string
        small: string
        grid: string
    }
    nsfw: boolean
    type?: string
    date?: string
    eps?: number
    series?: boolean
    tags?: {
        name: string
        count: number
    }[]
    characters?: {
        id: number
        name: string
        nameCN?: string
        image?: string
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

export type DetailResponse = {
    [key: string]: {
        id: number
        type: number
        airtime: { date: string }
        eps: number
        volumes: number
        relations: { relation: number }[]
        tags: {
            name: string
            count: number
        }[]
        characters: {
            character: {
                id: number
                name: string
                images?: { grid: string }
                infobox?: {
                    key: string
                    values: {
                        k: string
                        v: string
                    }[]
                }[]
            }
            type: number
        }[]
    }
}
