"use client"

import * as React from "react"
import useSWRInfinite from "swr/infinite"
import { SearchSlash, Ban } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { useQueryStates, parseAsJson, parseAsString, parseAsStringLiteral } from "nuqs"

import {
    Item,
    ItemContent,
    ItemGroup,
    ItemHeader,
    ItemSeparator,
} from "@/components/ui/item"
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"

import { NavigationBar } from "@/components/navigation-bar"
import { SearchBox } from "@/components/search-box"
import { AdvancedFilter } from "@/components/advanced-filter"
import { SubjectCard } from "@/components/subject-card"
import { ratingSchema, airDateSchema, tagSchema } from "@/lib/search-params"
import { Category, Sort, AirDateMode, Season } from "@/lib/constants"
import { SearchPayload, SearchResponse } from "@/types/api"

const apiUrl = process.env.NEXT_PUBLIC_API_URL
const searchEndPoint = process.env.NEXT_PUBLIC_SEARCH_ENDPOINT
const pageLimit = 20;

const categoryValues = Object.values(Category);
const sortValues = Object.values(Sort);
const seasonValues = Object.values(Season);

const CategoryID = {
    [Category.Anime]: 2,
    [Category.Book]: 1,
    [Category.Game]: 4,
    [Category.Music]: 3,
    [Category.Real]: 6
} as const
const SeasonStart = {
    [Season.Winter]: 1,
    [Season.Spring]: 4,
    [Season.Summer]: 7,
    [Season.Autumn]: 10,
} as const

const fetcher = async ([url, payload]: [string, SearchPayload]) => {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        throw new Error("Failed to load subjects.")
    }

    return await res.json()
}

export function HomeContent({ now }: { now: Date }) {
    // Sync filters with URL query parameters
    const [filters] = useQueryStates({
        query: parseAsString.withDefault(''),
        category: parseAsStringLiteral(categoryValues).withDefault(Category.Anime),
        sort: parseAsStringLiteral(sortValues).withDefault(Sort.Match),

        airDate: parseAsJson(airDateSchema).withDefault({
            enable: false,
            mode: AirDateMode.Period,
            year: now.getFullYear(),
            season: seasonValues[Math.floor(now.getMonth() / 3)],
        }),

        rating: parseAsJson(ratingSchema).withDefault({
            enable: false,
            min: 6,
            max: 8,
        }),

        tag: parseAsJson(tagSchema).withDefault({
            enable: false,
            tags: [],
        }),
    })

    const getKey = (pageIndex: number, previousPageData: SearchResponse | null) => {
        if (previousPageData && previousPageData.total <= previousPageData.limit + previousPageData.offset) { return null; }

        const airDate = filters.airDate.enable && filters.airDate.mode === AirDateMode.Range
            ? [
                filters.airDate.from ? `>=${filters.airDate.from}` : null,
                filters.airDate.to ? `<=${filters.airDate.to}` : null
            ].filter((val) => val !== null)
            : [];
        const rating = filters.rating.enable
            ? [`>=${filters.rating.min}`, `<=${filters.rating.max}`]
            : [];
        const tags = [...new Set([
            ...(filters.airDate.enable && filters.airDate.mode === AirDateMode.Period
                ? [filters.category === Category.Anime ? `${filters.airDate.year}年${SeasonStart[filters.airDate.season]}月` : filters.airDate.year.toString()]
                : []),
            ...(filters.tag.enable
                ? filters.tag.tags
                : []),
        ])];
        const rank = filters.sort === Sort.Rank ? [">0"] : [];

        const params = new URLSearchParams({
            limit: pageLimit.toString(),
            offset: (pageIndex * pageLimit).toString(),
        });
        const payload: SearchPayload = {
            keyword: filters.query,
            sort: filters.sort,
            filter: {
                type: [CategoryID[filters.category]],
                ...(tags.length > 0 && { tag: tags }),
                ...(airDate.length > 0 && { air_date: airDate }),
                ...(rating.length > 0 && { rating: rating }),
                ...(rank.length > 0 && { rank: rank }),
            },
        };
        return [`${apiUrl}${searchEndPoint}?${params}`, payload]
    }
    const { data, error, isLoading, size, setSize } = useSWRInfinite<SearchResponse>(getKey, fetcher)

    const { ref, inView } = useInView({ rootMargin: '100px' })
    React.useEffect(() => {
        if (inView && !isLoading) {
            setSize((prev) => prev + 1)
        }
    }, [inView, isLoading, setSize])

    const firstPage = data?.at(0);
    const suggestedTags = React.useMemo(() => {
        if (!firstPage?.data || firstPage.data.length === 0) { return []; }

        return Array.from(
            firstPage.data
                .flatMap((subject) => subject.tags ?? [])
                .reduce((acc, tag) => acc.set(tag.name, (acc.get(tag.name) || 0) + tag.count / Math.sqrt(tag.total_cont)), new Map<string, number>()))
            // filter out tags that are too long
            .filter((tag) => tag && tag[0].length < 16)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name]) => name);
    }, [firstPage]);

    const reachedEnd = data && data.length && data.at(-1)!.total <= data.at(-1)!.limit + data.at(-1)!.offset;

    return (
        <div className="flex min-h-screen items-center justify-center font-sans">
            <main className="flex min-h-screen w-full max-w-400 flex-col items-center gap-6 py-2 px-4 sm:py-6 sm:px-12 sm:items-start">
                <NavigationBar />
                <SearchBox isLoading={isLoading} />
                <AdvancedFilter
                    now={now}
                    suggestedTags={suggestedTags.filter((tag) => tag && !(filters.category === Category.Anime
                        ? /^\d{4}年(\d{1,2}月)?$/.test(tag)
                        : /^\d{4}(年)?$/.test(tag)
                    ))}
                    isLoading={isLoading}
                />

                <ItemGroup className="grid w-full gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {data?.flatMap((page) =>
                        page.data
                            // exclude mismatches by air date
                            .filter((subject) => filters.airDate.enable && filters.airDate.mode === AirDateMode.Period
                                ? (filters.category === Category.Anime
                                    ? [`${filters.airDate.year}年${SeasonStart[filters.airDate.season]}月`]
                                    : [filters.airDate.year.toString(), `${filters.airDate.year}年`])
                                    .includes(subject.tags.find((tag) => filters.category === Category.Anime
                                        ? /^\d{4}年\d{1,2}月$/.test(tag.name)
                                        : /^\d{4}(年)?$/.test(tag.name))?.name ?? "")
                                : subject)
                            .map((subject) => (<SubjectCard key={subject.id} subject={subject} />))
                    )}
                    {size > (data?.length ?? 0) && !reachedEnd && (
                        <>{Array.from({ length: pageLimit }).map((_, index) => (
                            <Item key={`skeleton-${index}`} variant="muted" className="flex-nowrap items-stretch sm:flex-wrap">
                                <ItemHeader className="basis-auto sm:basis-full">
                                    <Skeleton className="h-full w-auto sm:h-auto sm:w-full aspect-3/4 rounded-sm" />
                                </ItemHeader>
                                <ItemContent>
                                    <Skeleton className="h-6 w-1/2" />
                                    <ItemSeparator className="my-1" />
                                    <Skeleton className="h-4 w-2/3" />
                                    <ul className="pt-2 flex w-full flex-wrap gap-2 items-center h-30 content-start overflow-hidden">
                                        <li className="contents"><Skeleton className="h-[22px] w-12 rounded-full" /></li>
                                        <li className="contents"><Skeleton className="h-[22px] w-24 rounded-full" /></li>
                                        <li className="contents"><Skeleton className="h-[22px] w-12 rounded-full" /></li>
                                        <li className="contents"><Skeleton className="h-[22px] w-18 rounded-full" /></li>
                                        <li className="contents"><Skeleton className="h-[22px] w-36 rounded-full" /></li>
                                        <li className="contents"><Skeleton className="h-[22px] w-12 rounded-full" /></li>
                                        <li className="contents"><Skeleton className="h-[22px] w-24 rounded-full" /></li>
                                        <li className="contents"><Skeleton className="h-[22px] w-12 rounded-full" /></li>
                                        <li className="contents"><Skeleton className="h-[22px] w-18 rounded-full" /></li>
                                        <li className="contents"><Skeleton className="h-[22px] w-36 rounded-full" /></li>
                                    </ul>
                                </ItemContent>
                            </Item>
                        ))}</>
                    )}
                </ItemGroup>
                {!reachedEnd && size === (data?.length ?? 0) && <div ref={ref} />}
                <Empty className="w-full">
                    {reachedEnd && data.at(-1)?.total === 0 && (
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <SearchSlash />
                            </EmptyMedia>
                            <EmptyTitle>No Results</EmptyTitle>
                            <EmptyDescription>
                                Try adjusting your search to pick stuff cool
                            </EmptyDescription>
                        </EmptyHeader>
                    )}
                    {error && (
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Ban />
                            </EmptyMedia>
                            <EmptyTitle>Error</EmptyTitle>
                            <EmptyDescription>
                                Unexpected error occurred while picking stuff cool
                            </EmptyDescription>
                        </EmptyHeader>
                    )}
                </Empty>
            </main>
        </div>
    );
}
