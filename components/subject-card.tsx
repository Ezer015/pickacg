"use client"

import * as React from "react"
import { useQueryState, parseAsString, parseAsArrayOf, parseAsBoolean } from "nuqs"
import Image from "next/image"
import { Copy, Plus } from "lucide-react"

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
import Link from "next/link"
import { toast } from "sonner"

const bangumiUrl = process.env.NEXT_PUBLIC_BANGUMI_URL
const placeholderUrl = "https://lain.bgm.tv/img/no_icon_subject.png"

export function SubjectCard({
    className,
    subject,
    ...props
}: React.ComponentProps<typeof Item> & { subject: Subject }) {
    // Sync states with URL query parameters
    const [selectedTags, setSelectedTags] = useQueryState('tags', parseAsArrayOf(parseAsString).withDefault([]))
    const [withTag] = useQueryState('withTag', parseAsBoolean.withDefault(false))

    const [isLoading, setIsLoading] = React.useState(true);

    return (
        <Item key={subject.id} variant="muted" className={className} {...props}>
            <ItemHeader className="relative">
                {subject.rating.score > 0.0 && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge variant="secondary" className="absolute right-2 top-2 z-10 px-1.5 rounded-sm font-semibold bg-accent/60 backdrop-blur-xs">
                                    {subject.rating.score.toFixed(1)}
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>{subject.rating.total} <span className="font-medium">Votes</span></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
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
                            className="rounded-sm object-cover"
                            onLoad={() => setIsLoading(false)}
                            unoptimized={true}
                        />
                    </Link>
                </figure>
            </ItemHeader>
            <ItemContent className="min-w-0">
                <div className="flex justify-between gap-2">
                    <ItemTitle className="text-lg font-bold line-clamp-1">
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
                <ItemTitle className="text-sm text-muted-foreground line-clamp-1">{subject.name_cn ? subject.name : "Missing Translation..."}</ItemTitle>
                <ul className="pt-2 flex w-full flex-wrap gap-2 items-center h-30 content-start overflow-hidden">
                    {subject.tags
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
                                <Badge variant={withTag && selectedTags.includes(tag.name) ? "default" : "secondary"}>
                                    {tag.name}
                                    {!selectedTags.includes(tag.name) && (
                                        <Button
                                            variant="ghost"
                                            size="icon-6xs"
                                            className="rounded-full text-muted-foreground hover:text-foreground"
                                            onClick={() => setSelectedTags([...selectedTags, tag.name])}
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
