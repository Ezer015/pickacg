"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { useQueryStates, parseAsStringLiteral, parseAsJson } from "nuqs"
import { ChevronsUpDown, ArrowDownWideNarrow, Clock, Star, Tag, CalendarDays, CalendarRange, CalendarIcon, WholeWord, Flame, Trophy, RotateCcw, Snowflake, Sun, Flower, Leaf } from "lucide-react"

import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { TagArea } from "@/components/tag-area"

import { cn } from "@/lib/utils"
import { Category, Sort, AirDateMode, Season } from "@/lib/constants"
import { airDateSchema, ratingSchema, tagSchema } from "@/lib/search-params"
import { type Option } from "@/types/option"


// Type guard for SortValue
type SortValue = typeof Sort[keyof typeof Sort]
const sortValues = Object.values(Sort)
function isSortValue(value: string): value is SortValue {
    return sortValues.includes(value as SortValue)
}
// Type guard for SeasonValue
type SeasonValue = typeof Season[keyof typeof Season]
const seasonValues = Object.values(Season)
function isSeasonValue(value: string): value is SeasonValue {
    return seasonValues.includes(value as SeasonValue)
}

// Options for sort select
const sortOptions: Option[] = [
    {
        value: Sort.Match,
        label: "Match",
        icon: WholeWord,
    },
    {
        value: Sort.Heat,
        label: "Heat",
        icon: Flame,
    },
    {
        value: Sort.Rank,
        label: "Rank",
        icon: Trophy,
    }
] as const
// Options for air date mode select
const airDateModeOptions: Option[] = [
    {
        value: AirDateMode.Period,
        label: "Period",
        icon: CalendarDays,
    },
    {
        value: AirDateMode.Range,
        label: "Range",
        icon: CalendarRange,
    }
] as const
// Options for season select
const seasonOptions = [
    {
        value: Season.Winter,
        label: "Winter",
        icon: Snowflake,
    },
    {
        value: Season.Spring,
        label: "Spring",
        icon: Flower,
    },
    {
        value: Season.Summer,
        label: "Summer",
        icon: Sun,
    },
    {
        value: Season.Autumn,
        label: "Autumn",
        icon: Leaf,
    }
] as const


function ActivationTooltipWrapper({
    pressed,
    children,
}: {
    pressed: boolean
    children: React.ReactNode
}) {
    return (<TooltipProvider>
        {pressed ? children : (
            <Tooltip>
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                <TooltipContent side="left">
                    Click to Activate
                </TooltipContent>
            </Tooltip>
        )}
    </TooltipProvider>
    )
}

export function AdvancedFilter({
    className,
    suggestedTags = [],
    isLoading = false,
    ...props
}: React.ComponentProps<typeof Collapsible> & {
    suggestedTags?: string[],
    isLoading?: boolean,
}) {
    const now = React.useMemo(() => new Date(), [])

    // Sync states with URL query parameters
    const [filters, setFilters] = useQueryStates({
        category: parseAsStringLiteral(Object.values(Category)).withDefault(Category.Anime),
        sort: parseAsStringLiteral(sortValues).withDefault(Sort.Match),
        airDate: parseAsJson(airDateSchema).withDefault({
            enable: false,
            mode: AirDateMode.Period,
            year: now.getFullYear(),
        }),
        rating: parseAsJson(ratingSchema).withDefault({
            enable: false,
            min: 6,
            max: 8,
        }),
        tags: parseAsJson(tagSchema).withDefault({
            enable: false,
            tags: [],
        }),
    })

    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className={cn("flex w-full flex-col gap-4", className)}
            {...props}
        >
            <ul className="flex items-center gap-2">
                <li className="contents">
                    <ArrowDownWideNarrow className="h-9 px-2 min-w-9 rounded-full bg-accent/60 text-muted-foreground mr-1" />
                </li>
                <li className="contents">
                    <ToggleGroup
                        type="single"
                        variant="outline"
                        value={filters.sort}
                        onValueChange={(value) => { if (isSortValue(value)) { setFilters({ sort: value }) } }}
                    >
                        {sortOptions.map((option) => (
                            <ToggleGroupItem key={option.value} value={option.value} className="w-17 sm:w-23 capitalize">
                                {option.icon && <option.icon className="hidden sm:block" />} {option.label}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </li>
                <li className="contents">
                    <ul className="flex ml-auto gap-2">
                        <li className="contents">
                            {isOpen && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-muted-foreground"
                                    onClick={() => setFilters({ airDate: null, rating: null, tags: null })}
                                >
                                    <RotateCcw />
                                </Button>
                            )}
                        </li>
                        <li className="contents">
                            <CollapsibleTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-muted-foreground"
                                >
                                    <ChevronsUpDown />
                                </Button>
                            </CollapsibleTrigger>
                        </li>
                    </ul>
                </li>
            </ul>
            <CollapsibleContent className="flex flex-col gap-4">
                <ul className="flex items-center gap-2">
                    <li className="contents">
                        <ActivationTooltipWrapper pressed={filters.airDate.enable}>
                            <Toggle
                                pressed={filters.airDate.enable}
                                onPressedChange={(value) => setFilters({ airDate: { ...filters.airDate, enable: value } })}
                                className="mr-1"
                            >
                                <Clock className="text-muted-foreground" />
                            </Toggle>
                        </ActivationTooltipWrapper>
                    </li>
                    <li className="contents">
                        <ToggleGroup
                            type="single"
                            variant="outline"
                            value={filters.airDate.mode}
                            onValueChange={(value) => {
                                if (value === AirDateMode.Period) {
                                    setFilters({
                                        airDate: {
                                            enable: filters.airDate.enable,
                                            mode: AirDateMode.Period,
                                            year: now.getFullYear(),
                                            season: seasonValues[Math.floor(now.getMonth() / 3)],
                                        }
                                    })
                                } else if (value === AirDateMode.Range) {
                                    setFilters({
                                        airDate: {
                                            enable: filters.airDate.enable,
                                            mode: AirDateMode.Range,
                                        }
                                    })
                                }
                            }}
                            disabled={!filters.airDate.enable}
                        >
                            {airDateModeOptions.map((option) => (
                                <ToggleGroupItem key={option.value} value={option.value} className="w-17 sm:w-23 capitalize">
                                    {option.icon && <option.icon className="hidden sm:block" />} {option.label}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </li>
                    <li className="flex items-center gap-2 min-w-0">
                        {filters.airDate.mode === AirDateMode.Period && (
                            <>
                                <Select value={filters.airDate.year.toString()} onValueChange={(value) => {
                                    if (filters.airDate.mode === AirDateMode.Period) {
                                        setFilters({ airDate: { ...filters.airDate, year: parseInt(value, 10) } })
                                    }
                                }} disabled={!filters.airDate.enable}>
                                    <SelectTrigger className="sm:w-28 font-medium">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-64 w-[--radix-select-trigger-width] min-w-[--radix-select-trigger-width]">
                                        {Array.from({ length: (now.getFullYear() + 1) - 1970 + 1 }, (_, i) => now.getFullYear() + 1 - i).map((year) => (
                                            <SelectItem key={year} value={year.toString()}>
                                                <time dateTime={year.toString()} className="relative text-muted-foreground">
                                                    <CalendarIcon />
                                                    <div className="absolute inset-0 flex items-center justify-center pt-[35%]">
                                                        <span className="text-[0.5rem] font-black font-mono">
                                                            {year % 100}
                                                        </span>
                                                    </div>
                                                </time>
                                                <Label className="capitalize hidden sm:block">{year}</Label>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {filters.category === Category.Anime && (
                                    <Select value={filters.airDate.season ?? seasonValues[Math.floor(now.getMonth() / 3)]} onValueChange={(value) => {
                                        if (filters.airDate.mode === AirDateMode.Period && isSeasonValue(value)) {
                                            setFilters({ airDate: { ...filters.airDate, season: value } })
                                        }
                                    }} disabled={!filters.airDate.enable}>
                                        <SelectTrigger className="sm:w-32 font-medium">
                                            <SelectValue placeholder="Season" />
                                        </SelectTrigger>
                                        <SelectContent className="w-[--radix-select-trigger-width] min-w-[--radix-select-trigger-width]">
                                            {seasonOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <option.icon /> <Label className="capitalize hidden sm:block">{option.label}</Label>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </>
                        )}
                        {filters.airDate.mode === AirDateMode.Range && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant="outline"
                                        disabled={!filters.airDate.enable}
                                        className="max-w-full"
                                    >
                                        <span className="truncate">
                                            {filters.airDate.from && filters.airDate.to ? (
                                                `${format(parseISO(filters.airDate.from), "MMM dd, y")} ~ ${format(parseISO(filters.airDate.to), "MMM dd, y")}`
                                            ) : (
                                                <span className="text-muted-foreground">from ... to ...</span>
                                            )}
                                        </span>
                                        <CalendarIcon />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="range"
                                        defaultMonth={filters.airDate.from ? parseISO(filters.airDate.from) : undefined}
                                        selected={{
                                            from: filters.airDate.from ? parseISO(filters.airDate.from) : undefined,
                                            to: filters.airDate.to ? parseISO(filters.airDate.to) : undefined
                                        }}
                                        onSelect={(range) => {
                                            if (filters.airDate.mode === AirDateMode.Range) {
                                                setFilters({
                                                    airDate: {
                                                        ...filters.airDate,
                                                        from: range?.from ? format(range.from, "yyyy-MM-dd") : undefined,
                                                        to: range?.to ? format(range.to, "yyyy-MM-dd") : undefined,
                                                    }
                                                })
                                            }
                                        }}
                                        endMonth={new Date(now.getFullYear(), now.getMonth() + 6)}
                                        numberOfMonths={2}
                                        captionLayout="dropdown"
                                        hideWeekdays
                                        className="rounded-lg shadow-sm"
                                        disabled={!filters.airDate.enable}
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    </li>
                </ul>
                <ul className="flex h-7 items-center gap-2">
                    <li className="contents">
                        <ActivationTooltipWrapper pressed={filters.rating.enable}>
                            <Toggle
                                pressed={filters.rating.enable}
                                onPressedChange={(value) => setFilters({ rating: { ...filters.rating, enable: value } })}
                                className="mr-1"
                            >
                                <Star className="text-muted-foreground" />
                            </Toggle>
                        </ActivationTooltipWrapper>
                    </li>
                    <li className="flex w-full max-w-3xs items-center gap-2 ml-2">
                        <Label className="text-xs text-muted-foreground tabular-nums">
                            {filters.rating.min.toFixed(1)}
                        </Label>
                        <Slider
                            value={[filters.rating.min, filters.rating.max]}
                            onValueChange={(value) => setFilters({ rating: { ...filters.rating, min: value[0], max: value[1] } })}
                            min={0}
                            max={9}
                            step={1}
                            disabled={!filters.rating.enable}
                        />
                        <Label className="text-xs text-muted-foreground tabular-nums">
                            {filters.rating.max.toFixed(1)}
                        </Label>
                    </li>
                </ul>
                <ul className="flex gap-2">
                    <li className="contents">
                        <ActivationTooltipWrapper pressed={filters.tags.enable}>
                            <Toggle
                                pressed={filters.tags.enable}
                                onPressedChange={(value) => setFilters({ tags: { ...filters.tags, enable: value } })}
                                className="mr-1"
                            >
                                <Tag className="text-muted-foreground" />
                            </Toggle>
                        </ActivationTooltipWrapper>
                    </li>
                    <li className="mt-0.5">
                        <TagArea
                            suggestedTags={isLoading ? [] : suggestedTags}
                            disabled={!filters.tags.enable}
                        />
                    </li>
                </ul>
            </CollapsibleContent>
        </Collapsible >
    )
}
