"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import useSWRInfinite from "swr/infinite"
import { SearchSlash, Ban } from "lucide-react"
import { SiGithub } from "react-icons/si";
import { useInView } from "react-intersection-observer"
import { useQueryStates, parseAsArrayOf, parseAsBoolean, parseAsInteger, parseAsIsoDate, parseAsString, parseAsStringEnum } from "nuqs"

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
import { SearchBox } from "@/components/search-box"
import { AdvancedFilter } from "@/components/advanced-filter"
import { SubjectCard } from "@/components/subject-card"
import { Button } from "@/components/ui/button"
import { Category, Sort, AirDateMode, Season } from "@/lib/constants"
import { SearchPayload, SearchResponse } from "@/types/api"

const apiUrl = process.env.NEXT_PUBLIC_API_URL
const searchEndPoint = process.env.NEXT_PUBLIC_SEARCH_ENDPOINT
const pageLimit = 20;

const categoryValues = Object.values(Category);
const sortValues = Object.values(Sort);
const airDateModeValues = Object.values(AirDateMode);
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
        category: parseAsStringEnum(categoryValues).withDefault(Category.Anime),
        sort: parseAsStringEnum(sortValues).withDefault(Sort.Match),
        airDate: parseAsStringEnum(airDateModeValues).withDefault(AirDateMode.Period),
        year: parseAsInteger.withDefault(now.getFullYear()),
        season: parseAsStringEnum(seasonValues).withDefault(seasonValues[Math.floor(now.getMonth() / 3)]),
        startDate: parseAsIsoDate,
        endDate: parseAsIsoDate,
        rating: parseAsArrayOf(parseAsInteger).withDefault([6, 8]),
        tags: parseAsArrayOf(parseAsString).withDefault([]),

        withAirDate: parseAsBoolean.withDefault(false),
        withRating: parseAsBoolean.withDefault(false),
        withTag: parseAsBoolean.withDefault(false),
    })

    const getKey = (pageIndex: number, previousPageData: SearchResponse | null) => {
        if (previousPageData && previousPageData.data.length === 0) { return null; }

        const airDate = filters.withAirDate && filters.airDate === AirDateMode.Range
            ? [
                filters.startDate ? `>=${filters.startDate.toISOString().slice(0, 10)}` : null,
                filters.endDate ? `<=${filters.endDate.toISOString().slice(0, 10)}` : null
            ].filter((val) => val !== null) : [];
        const rating = filters.withRating && filters.rating.length === 2
            ? [`>=${filters.rating.at(0) ?? 0}`, `<=${filters.rating.at(1) ?? 10000}`] : [];
        const tags = [...new Set([
            ...(filters.withAirDate && filters.airDate === AirDateMode.Period
                ? [filters.category === Category.Anime ? `${filters.year}年${SeasonStart[filters.season]}月` : filters.year.toString()]
                : []),
            ...(filters.withTag
                ? filters.tags
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
                .flatMap(subject => subject.tags ?? [])
                .reduce((acc, tag) => {
                    acc.set(tag.name, (acc.get(tag.name) || 0) + tag.count);
                    return acc;
                }, new Map<string, number>()))
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name]) => name);
    }, [firstPage]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex min-h-screen w-full max-w-7xl flex-col items-center gap-6 py-12 px-6 bg-white dark:bg-black sm:items-start">
                <header className="grid w-full grid-cols-[1fr_auto_1fr] items-center">
                    <div /> {/* Placeholder */}
                    <div className="flex items-center justify-center gap-4">
                        <Image
                            className="dark:invert"
                            src="/pick-anime-cool.svg"
                            alt="Pick Anime Cool logo"
                            width={80}
                            height={80}
                            priority
                        />
                        <h1 className="text-4xl font-extrabold text-center">
                            Pick Anime Cool
                        </h1>
                    </div>
                    <div className="flex justify-end">
                        <Button variant="ghost" size="icon-lg" asChild>
                            <Link
                                href="https://github.com/Ezer015/pick-anime-cool"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <SiGithub className="size-6" aria-hidden="true" />
                            </Link>
                        </Button>
                    </div>
                </header>
                <SearchBox isLoading={isLoading} />
                <AdvancedFilter
                    now={now}
                    suggestedTags={suggestedTags.filter(tag => tag !== (filters.category === Category.Anime
                        ? `${filters.year}年${SeasonStart[filters.season]}月`
                        : filters.year.toString()
                    ))}
                    isLoading={isLoading}
                />

                <ItemGroup
                    className={`grid w-full gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4`}
                >
                    {data?.flatMap((page) =>
                        page.data.map((subject) => (<SubjectCard key={subject.id} subject={subject} />))
                    )}
                    {(isLoading || (data && size > data.length && data.at(-1)?.data?.length !== 0)) && (
                        <>{Array.from({ length: pageLimit }).map((_, index) => (
                            <Item key={`skeleton-${index}`} variant="muted">
                                <ItemHeader>
                                    <Skeleton className="aspect-3/4 w-full rounded-sm" />
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
                {data?.at(-1)?.data?.length !== 0 && <div ref={ref} />}
                <Empty className="w-full">
                    {!isLoading && data?.at(0)?.data?.length === 0 && (
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
