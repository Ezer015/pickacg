"use server"

import { SearchParam, SearchPayload, SearchResponse } from "@/types/api"
import { createClient, cacheExchange, fetchExchange } from "urql"
import { registerUrql } from '@urql/next/rsc';

const apiUrl = process.env.API_URL

const makeClient = () => createClient({
    url: `${process.env.NEXT_PUBLIC_API_URL}/v0/graphql`,
    exchanges: [cacheExchange, fetchExchange],
    preferGetMethod: false,
});
const { getClient } = registerUrql(makeClient);

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
    });

    if (!rawResult.ok) {
        throw new Error("Failed to load subjects.");
    }

    const searchData: SearchResponse = await rawResult.json();
    const subjects = searchData.data;

    if (!subjects || subjects.length === 0) {
        return searchData;
    }

    try {
        const result = await getClient().query(`
            query {
                ${subjects.map(({ id }) => `
                    subject${id}: subject(id: ${id}) {
                        id
                        airtime { date }
                        eps
                        tags { name count }
                    }
                `).join('\n')}
            }
        `, {});

        if (result.error) {
            console.error("Subject Detail GraphQL Query Error:", result.error);
            return searchData;
        }

        const detailedSubjects = subjects.map((subject) => {
            const extra = result.data[`subject${subject.id}`];
            if (!extra) {
                return subject;
            }

            return {
                ...subject,
                date: extra.airtime?.date,
                eps: extra.eps > 0 ? extra.eps : undefined,
                tags: extra.tags,
            };
        });

        return {
            ...searchData,
            data: detailedSubjects
        };

    } catch (e) {
        console.error("Subject Detail Query Error:", e);
        return searchData;
    }
}
