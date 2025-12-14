"use client"

import * as React from "react"
import { useQueryState, parseAsStringLiteral, parseAsJson } from "nuqs"
import Link from "next/link"
import Image from "next/image"
import { Copy, Plus, CalendarFold, Clapperboard } from "lucide-react"
import { toast } from "sonner"

import {
    Item,
    ItemContent,
    ItemHeader,
    ItemSeparator,
    ItemTitle,
} from "@/components/ui/item"
import { Badge } from "@/components/ui/badge"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { type Subject } from "@/types/api"
import { tagSchema } from "@/lib/search-params"
import { Category } from "@/lib/constants"

const bangumiUrl = process.env.NEXT_PUBLIC_BANGUMI_URL
const placeholderUrl = "https://lain.bgm.tv/img/no_icon_subject.png"

export function SubjectCard({
    className,
    subject,
    ...props
}: React.ComponentProps<typeof Item> & { subject: Subject }) {
    // Sync states with URL query parameters
    const [tagFilter, setTagFilter] = useQueryState('tag', parseAsJson(tagSchema).withDefault({ enable: false, tags: [] }))
    const [category] = useQueryState('category', parseAsStringLiteral(Object.values(Category)).withDefault(Category.Anime))

    const [isLoading, setIsLoading] = React.useState(true);

    return (
        <Item key={subject.id} variant="muted" className={className} {...props}>
            <ItemHeader className="relative">
                <figure className="relative aspect-3/4 h-full w-full overflow-hidden rounded-sm">
                    {isLoading && (
                        <Skeleton className="absolute inset-0 h-full w-full z-10" />
                    )}
                    <Link
                        href={`${bangumiUrl}/subject/${subject.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative block h-full w-full"
                    >
                        <Image
                            src={subject.image || placeholderUrl}
                            alt={subject.name_cn || subject.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover"
                            onLoad={() => setIsLoading(false)}
                            unoptimized={true}
                        />
                    </Link>
                    <ul className="absolute top-2 px-2 w-full flex gap-1 items-start justify-between">
                        <li>
                            {subject.rating.rank > 0 && (
                                <Badge variant="secondary" className="z-10 bg-accent/60 backdrop-blur-xs font-semibold">
                                    # {subject.rating.rank}
                                </Badge>
                            )}
                        </li>
                        <li className="contents">
                            {subject.rating.score > 0.0 && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Badge variant="secondary" className="z-10 bg-accent/60 backdrop-blur-xs font-semibold">
                                                {subject.rating.score.toFixed(1)}
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>{subject.rating.total} <span className="font-medium">Votes</span></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </li>
                    </ul>
                    <ul className="absolute bottom-2 px-2 w-full flex gap-1 items-start justify-between">
                        <li className="contents">
                            <Badge variant="secondary" className="bg-accent/60 backdrop-blur-xs font-medium">
                                <CalendarFold className="mr-0.5" />
                                {subject.date}
                            </Badge>
                        </li>
                        <li className="contents">
                            {subject.eps > 0 && (
                                <Badge variant="secondary" className="bg-accent/60 backdrop-blur-xs font-medium">
                                    <Clapperboard className="mr-0.5" />
                                    {subject.eps} eps
                                </Badge>
                            )}
                        </li>
                    </ul>
                </figure>
            </ItemHeader>
            <ItemContent className="min-w-0">
                <div className="flex justify-between gap-2">
                    <ItemTitle className="text-lg font-bold line-clamp-1" lang={subject.name_cn ? "zh" : "jp"}>
                        {subject.name_cn || subject.name}
                    </ItemTitle>
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => {
                            navigator.clipboard.writeText(subject.name_cn || subject.name);
                            toast.success("Copied to clipboard", { position: "top-center" });
                        }}
                    >
                        <Copy />
                    </Button>
                </div>
                <ItemSeparator />
                <ItemTitle className="text-sm text-muted-foreground line-clamp-1" lang={subject.name_cn ? "ja" : "en"}>{subject.name_cn ? subject.name : "Missing Translation..."}</ItemTitle>
                <ul className="pt-2 flex w-full flex-wrap gap-2 items-center h-30 content-start overflow-hidden">
                    {subject.tags
                        // filter out tags that are too long
                        .filter((tag) => tag.name.length < 16)
                        // filter out air date tags
                        .filter((tag) => tag.name && !(category === Category.Anime
                            ? /^\d{4}年(\d{1,2}月)?$/.test(tag.name)
                            : /^\d{4}(年)?$/.test(tag.name)
                        ))
                        // sort by ratio
                        .sort((a, b) => {
                            const ratioA = a.total_cont !== 0 ? a.count / a.total_cont : 0;
                            const ratioB = b.total_cont !== 0 ? b.count / b.total_cont : 0;
                            return Math.max(ratioA, ratioB) <= Math.min(ratioA, ratioB) * 10
                                ? ratioB - ratioA
                                : b.count - a.count;
                        })
                        .map((tag) => (
                            <li key={tag.name} className="contents">
                                <Badge variant={tagFilter.enable && tagFilter.tags.includes(tag.name) ? "default" : "secondary"}>
                                    {tag.name}
                                    {!tagFilter.tags.includes(tag.name) && (
                                        <Button
                                            variant="ghost"
                                            size="icon-6xs"
                                            className="rounded-full text-muted-foreground hover:text-foreground"
                                            onClick={() => setTagFilter({ ...tagFilter, tags: [...tagFilter.tags, tag.name] })}
                                        >
                                            <Plus />
                                        </Button>
                                    )}
                                </Badge>
                            </li>
                        ))}
                </ul>
            </ItemContent>
        </Item>
    )
}
