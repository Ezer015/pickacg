"use client"

import * as React from "react"
import { format } from "date-fns"
import { useQueryStates, parseAsStringLiteral, parseAsJson } from "nuqs"
import { ChevronsUpDown, ArrowDownWideNarrow, Clock, Star, Tag, CalendarDays, CalendarRange, CalendarIcon, WholeWord, Flame, Trophy, RotateCcw } from "lucide-react"

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
type SortValue = typeof Sort[keyof typeof Sort];
const sortValues = Object.values(Sort);
function isSortValue(value: string): value is SortValue {
    return sortValues.includes(value as SortValue);
}
// Type guard for SeasonValue
type SeasonValue = typeof Season[keyof typeof Season];
const seasonValues = Object.values(Season);
function isSeasonValue(value: string): value is SeasonValue {
    return seasonValues.includes(value as SeasonValue);
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
        label: "Winter"
    },
    {
        value: Season.Spring,
        label: "Spring"
    },
    {
        value: Season.Summer,
        label: "Summer"
    },
    {
        value: Season.Autumn,
        label: "Autumn"
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
    now,
    suggestedTags = [],
    isLoading = false,
    ...props
}: React.ComponentProps<typeof Collapsible> & {
    now: Date,
    suggestedTags?: string[],
    isLoading?: boolean,
}) {
    // Sync states with URL query parameters
    const [filters, setFilters] = useQueryStates({
        category: parseAsStringLiteral(Object.values(Category)).withDefault(Category.Anime),
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
                    <ArrowDownWideNarrow className="h-9 px-2 min-w-9 rounded-md bg-accent/60 text-muted-foreground mr-1" />
                </li>
                <li className="contents">
                    <ToggleGroup
                        type="single"
                        variant="outline"
                        value={filters.sort}
                        onValueChange={(value) => { if (isSortValue(value)) { setFilters({ sort: value }) } }}
                    >
                        {sortOptions.map((option) => (
                            <ToggleGroupItem key={option.value} value={option.value} className="w-23 capitalize">
                                {option.icon && <option.icon />} {option.label}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </li>

                <li className="contents">
                    {isOpen && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground ml-auto"
                            onClick={() => setFilters({ airDate: null, rating: null, tag: null })}
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
                            className={cn("size-8 text-muted-foreground", !isOpen && "ml-auto")}
                        >
                            <ChevronsUpDown />
                        </Button>
                    </CollapsibleTrigger>
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
                            }
                            }
                            disabled={!filters.airDate.enable}
                        >
                            {airDateModeOptions.map((option) => (
                                <ToggleGroupItem key={option.value} value={option.value} className="w-23 capitalize">
                                    {option.icon && <option.icon />} {option.label}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </li>
                    <li className="flex items-center gap-2">
                        {filters.airDate.mode === AirDateMode.Period && (
                            <>
                                <Select value={filters.airDate.year.toString()} onValueChange={(value) => {
                                    if (filters.airDate.mode === AirDateMode.Period) {
                                        setFilters({ airDate: { ...filters.airDate, year: parseInt(value, 10) } })
                                    }
                                }} disabled={!filters.airDate.enable}>
                                    <SelectTrigger className="w-21.5 font-medium">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-64 w-[--radix-select-trigger-width] min-w-[--radix-select-trigger-width]">
                                        {Array.from({ length: (now.getFullYear() + 1) - 1970 + 1 }, (_, i) => now.getFullYear() + 1 - i).map((year) => (
                                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {filters.category === Category.Anime && (
                                    <Select value={filters.airDate.season} onValueChange={(value) => {
                                        if (filters.airDate.mode === AirDateMode.Period && isSeasonValue(value)) {
                                            setFilters({ airDate: { ...filters.airDate, season: value } })
                                        }
                                    }} disabled={!filters.airDate.enable}>
                                        <SelectTrigger className="w-26.5 font-medium">
                                            <SelectValue placeholder="Season" />
                                        </SelectTrigger>
                                        <SelectContent className="w-[--radix-select-trigger-width] min-w-[--radix-select-trigger-width]">
                                            {seasonOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
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
                                    >
                                        {filters.airDate.from && filters.airDate.to ? (
                                            `${format(filters.airDate.from, "MMM dd, y")} ~ ${format(filters.airDate.to, "MMM dd, y")}`
                                        ) : (
                                            <span className="text-muted-foreground">from ... to ...</span>
                                        )}
                                        <CalendarIcon />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="range"
                                        defaultMonth={filters.airDate.from ? new Date(filters.airDate.from) : undefined}
                                        selected={{
                                            from: filters.airDate.from ? new Date(filters.airDate.from) : undefined,
                                            to: filters.airDate.to ? new Date(filters.airDate.to) : undefined
                                        }}
                                        onSelect={(range) => {
                                            if (filters.airDate.mode === AirDateMode.Range) {
                                                setFilters({
                                                    airDate: {
                                                        ...filters.airDate,
                                                        from: range?.from?.toISOString().slice(0, 10),
                                                        to: range?.to?.toISOString().slice(0, 10),
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
                            max={10}
                            step={0.1}
                            disabled={!filters.rating.enable}
                        />
                        <Label className="text-xs text-muted-foreground tabular-nums">
                            {filters.rating.max.toFixed(1)}
                        </Label>
                    </li>
                </ul>
                <ul className="flex gap-2">
                    <li className="contents">
                        <ActivationTooltipWrapper pressed={filters.tag.enable}>
                            <Toggle
                                pressed={filters.tag.enable}
                                onPressedChange={(value) => setFilters({ tag: { ...filters.tag, enable: value } })}
                                className="mr-1"
                            >
                                <Tag className="text-muted-foreground" />
                            </Toggle>
                        </ActivationTooltipWrapper>
                    </li>
                    <li className="mt-0.5">
                        <TagArea
                            suggestedTags={isLoading ? [] : suggestedTags}
                            disabled={!filters.tag.enable}
                        />
                    </li>
                </ul>
            </CollapsibleContent>
        </Collapsible >
    )
}
