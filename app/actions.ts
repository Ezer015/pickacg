"use server"

import { headers } from "next/headers"
import { createClient, cacheExchange, fetchExchange } from "urql"
import { registerUrql } from '@urql/next/rsc'

import { auth } from "@/lib/auth"
import { Category, Character, Relation } from "@/lib/constants"
import { SearchParam, SearchPayload, SearchResponse, TrendingResponse, DetailResponse } from "@/types/api"

const apiUrl = process.env.API_URL
const nextApiUrl = process.env.NEXT_API_URL
const userAgent = (() => {
    const projectRepoUrl = process.env.PROJECT_REPO_URL
    if (!projectRepoUrl) { return undefined }

    try {
        const repoPath = new URL(projectRepoUrl).pathname.replace(/^\//, "").replace(/\/$/, "")
        return `${repoPath} (${projectRepoUrl})`
    } catch {
        return `project (${projectRepoUrl})`
    }
})()

const makeClient = () => createClient({
    url: `https://${apiUrl}/v0/graphql`,
    exchanges: [cacheExchange, fetchExchange],
    preferGetMethod: false,
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
        const accessToken = await (async () => {
            try {
                const { accessToken } = await auth.api.getAccessToken({
                    body: { providerId: "bangumi" },
                    headers: await headers()
                })
                return accessToken
            } catch {
                // Unauthorized Escape
                return undefined
            }
        })()

        return fetch(input, {
            ...init,
            headers: {
                ...init?.headers,
                ...(userAgent && { "User-Agent": userAgent }),
                ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
            },
        })
    },
})
const { getClient } = registerUrql(makeClient)

const CategoryFromID = {
    2: Category.Anime,
    1: Category.Book,
    4: Category.Game,
    3: Category.Music,
    6: Category.Real
} as const
function isCategoryID(value: number): value is keyof typeof CategoryFromID {
    return Object.keys(CategoryFromID).includes(value.toString())
}

const relationValues = Object.values(Relation)

type CharacterQueryResponse = {
    id: number
    infobox?: {
        key: string
        values: { v: string }[]
    }[]
}

export async function search({
    params,
    payload
}: {
    params: SearchParam
    payload: SearchPayload
}): Promise<SearchResponse> {
    const accessToken = await (async () => {
        try {
            const { accessToken } = await auth.api.getAccessToken({
                body: { providerId: "bangumi" },
                headers: await headers()
            })
            return accessToken
        } catch {
            // Unauthorized Escape
            return undefined
        }
    })()

    const isTrending = payload.sort === "heat" &&
        payload.keyword === "" &&
        payload.filter.type.length === 1 &&
        (() => {
            const { type: _, ...rest } = payload.filter
            return Object.keys(rest).length === 0
        })()
    const searchParams = Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, value.toString()])
    )
    const rawResult = await fetch(
        isTrending
            ? `https://${nextApiUrl}/p1/trending/subjects?${new URLSearchParams({
                type: payload.filter.type[0].toString(),
                ...searchParams
            })}`
            : `https://${nextApiUrl}/p1/search/subjects?${new URLSearchParams(searchParams)}`,
        {
            method: isTrending ? "GET" : "POST",
            headers: {
                "Content-Type": "application/json",
                ...(userAgent && { "User-Agent": userAgent }),
                ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
            },
            ...(!isTrending && { body: JSON.stringify(payload) }),
        }
    )
    if (!rawResult.ok) {
        throw new Error("Failed to load subjects.")
    }

    const rawSearchData: SearchResponse | TrendingResponse = await rawResult.json()
    const searchData: SearchResponse = isTrending
        ? { ...rawSearchData, data: (rawSearchData as TrendingResponse).data.map(({ subject }) => subject) }
        : rawSearchData as SearchResponse
    searchData.data = searchData.data.map((subject) => {
        const typeId = parseInt(subject.type)
        if (!isCategoryID(typeId)) {
            throw new Error("Invalid subject type.", { cause: subject })
        }

        return {
            ...subject,
            type: CategoryFromID[typeId],
            images: ((images) => {
                const base = images?.large
                if (!base) { return images }

                const scale = (size: number) => {
                    try {
                        const url = new URL(base)
                        return base.replace(url.origin, `${url.origin}/r/${size}`)
                    } catch {
                        return base
                    }
                }
                return {
                    ...images,
                    medium: scale(800),
                    common: scale(400),
                    small: scale(200),
                    grid: scale(100)
                }
            })(subject.images)
        }
    })

    const subjects = searchData.data
    if (!subjects || subjects.length === 0) { return searchData }

    try {
        const result = await getClient().query(`
            query {
                ${subjects.map(({ id }) => `
                    subject${id}: subject(id: ${id}) {
                        id
                        airtime { date }
                        eps
                        volumes
                        tags { name count }
                        characters(limit: 100) {
                            character {
                                id
                                name
                                images { grid }
                            }
                            type
                        }
                        relations(includeTypes: [${relationValues.join(',')}]) { relation }
                    }
                `).join('\n')}
            }
        `, {})

        if (result.error) {
            console.error("Subject Detail Query Error:", result.error)
            return searchData
        }

        const detailData = result.data as DetailResponse

        // Collect all main character IDs to fetch their details (nameCN)
        const mainCharacterIds = new Set(
            Object.values(detailData)
                .flatMap((subject) => subject?.characters ?? [])
                .filter((c) => c.type === Character.Main)
                .map((c) => c.character.id)
        )

        const characterNameCN: Record<number, string | undefined> = mainCharacterIds.size > 0 ?
            await (async () => {
                const characterResult = await getClient().query(`
                    query {
                        ${Array.from(mainCharacterIds).map(id => `
                            character${id}: character(id: ${id}) {
                                id
                                infobox { key values { v } }
                            }
                        `).join('\n')}
                    }
                `, {})

                if (characterResult.error || !characterResult.data) { return {} }

                return Object.fromEntries(
                    Object.values(characterResult.data as Record<string, CharacterQueryResponse>)
                        .filter((c): c is CharacterQueryResponse => Boolean(c))
                        .map((character) => [
                            character.id,
                            character.infobox?.find(({ key }) => key === "简体中文名")?.values?.[0]?.v,
                        ])
                )
            })() : {}

        const subjectDetails = subjects.map((subject) => {
            const extra = detailData[`subject${subject.id}`]
            if (!extra) { return subject }

            return {
                ...subject,
                date: extra.airtime?.date !== "1899-11-30" ? extra.airtime?.date : undefined,
                eps: (subject.type === Category.Anime || subject.type === Category.Real) ? extra.eps
                    : subject.type === Category.Book ? extra.volumes || extra.eps
                        : undefined,
                series: !extra.relations?.some(({ relation }) => relation === Relation.Series),
                tags: (() => {
                    const yearPattern = /^\d{4}(年)?$/
                    const monthPattern = /^\d{4}年\d{1,2}月$/

                    const yearTags = extra.tags?.filter(t => yearPattern.test(t.name)) || []
                    const monthTags = extra.tags?.filter(t => monthPattern.test(t.name)) || []

                    const maxYearTag = yearTags.length > 0 ? yearTags.reduce((prev, curr) => (curr.count > prev.count ? curr : prev)) : null
                    const maxMonthTag = monthTags.length > 0 ? monthTags.reduce((prev, curr) => (curr.count > prev.count ? curr : prev)) : null

                    return extra.tags?.filter(tag => {
                        if (yearPattern.test(tag.name)) {
                            return tag === maxYearTag
                        }
                        if (monthPattern.test(tag.name)) {
                            return tag === maxMonthTag
                        }
                        return true
                    })
                })(),
                characters: extra.characters
                    .filter((c) => c.type === Character.Main)
                    .map((c) => ({
                        id: c.character.id,
                        name: c.character.name,
                        nameCN: characterNameCN[c.character.id],
                        image: c.character.images?.grid,
                    })),
            }
        })

        return { ...searchData, data: subjectDetails }

    } catch (e) {
        console.error("Subject Detail Query Error:", e)
        return searchData
    }
}
