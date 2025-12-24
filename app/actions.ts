"use server"

import { SearchParam, SearchPayload, SearchResponse, DetailResponse } from "@/types/api"
import { createClient, cacheExchange, fetchExchange } from "urql"
import { registerUrql } from '@urql/next/rsc'

import { Category, Character } from "@/lib/constants"

const apiUrl = process.env.API_URL

const makeClient = () => createClient({
    url: `${process.env.NEXT_PUBLIC_API_URL}/v0/graphql`,
    exchanges: [cacheExchange, fetchExchange],
    preferGetMethod: false,
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
    return Object.keys(CategoryFromID).includes(String(value))
}

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
    const rawResult = await fetch(`${apiUrl}/p1/search/subjects?${new URLSearchParams(Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])))}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    })

    if (!rawResult.ok) {
        throw new Error("Failed to load subjects.")
    }

    const searchData: SearchResponse = await rawResult.json()
    const subjects = searchData.data

    if (!subjects || subjects.length === 0) {
        return searchData
    }

    try {
        const result = await getClient().query(`
            query {
                ${subjects.map(({ id }) => `
                    subject${id}: subject(id: ${id}) {
                        id
                        type
                        airtime { date }
                        eps
                        volumes
                        series
                        tags { name count }
                        characters(limit: 100) {
                            character {
                                id
                                name
                                images { grid }
                            }
                            type
                        }
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
            if (!extra || !isCategoryID(extra.type)) { return subject }

            return {
                ...subject,
                type: CategoryFromID[extra.type],
                date: extra.airtime?.date,
                eps: (CategoryFromID[extra.type] === Category.Anime || CategoryFromID[extra.type] === Category.Real) ? extra.eps
                    : CategoryFromID[extra.type] === Category.Book ? extra.volumes || extra.eps
                        : undefined,
                series: extra.series,
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
