import {
    Item,
    ItemContent,
    ItemHeader,
    ItemSeparator,
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"

import { cn } from "@/lib/utils"

export function SkeletonCard({
    className,
    ...props
}: React.ComponentProps<typeof Item>) {
    return (
        <Item variant="muted" className={cn("flex-nowrap items-stretch sm:flex-wrap", className)} {...props}>
            <ItemHeader className="basis-auto sm:basis-full">
                <Skeleton className="h-full w-auto sm:h-auto sm:w-full aspect-3/4 rounded-2xl" />
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
    )
}
