"use client"

import * as React from "react"
import { type DateRange } from "react-day-picker"
import { format } from "date-fns"
import { useQueryState, useQueryStates, parseAsBoolean, parseAsInteger, parseAsStringEnum, parseAsArrayOf, parseAsIsoDate } from "nuqs"
import { ChevronsUpDown, ArrowDownWideNarrow, Clock, Star, Tag, CalendarDays, CalendarRange, CalendarIcon, WholeWord, Flame, Trophy } from "lucide-react"

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
import { type Option } from "@/types/option"


type SortValue = typeof Sort[keyof typeof Sort];
const sortValues = Object.values(Sort);
// Type guard for SortValue
function isSortValue(value: string): value is SortValue {
    return sortValues.includes(value as SortValue);
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

type AirDateModeValue = typeof AirDateMode[keyof typeof AirDateMode];
const airDateModeValues = Object.values(AirDateMode);
// Type guard for AirDateModeValue
function isAirDateModeValue(value: string): value is AirDateModeValue {
    return airDateModeValues.includes(value as AirDateModeValue);
}
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

// Type guard for SeasonValue
type SeasonValue = typeof Season[keyof typeof Season];
const seasonValues = Object.values(Season);
function isSeasonValue(value: string): value is SeasonValue {
    return seasonValues.includes(value as SeasonValue);
}
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

const categoryValues = Object.values(Category);


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
        sort: parseAsStringEnum(sortValues).withDefault(Sort.Match),
        airDate: parseAsStringEnum(airDateModeValues).withDefault(AirDateMode.Period),
        year: parseAsInteger.withDefault(now.getFullYear()),
        season: parseAsStringEnum(seasonValues).withDefault(seasonValues[Math.floor(now.getMonth() / 3)]),
        startDate: parseAsIsoDate,
        endDate: parseAsIsoDate,
        rating: parseAsArrayOf(parseAsInteger).withDefault([6, 8]),

        withAirDate: parseAsBoolean.withDefault(false),
        withRating: parseAsBoolean.withDefault(false),
        withTag: parseAsBoolean.withDefault(false),
    })
    const [category] = useQueryState("category", parseAsStringEnum(categoryValues).withDefault(Category.Anime))

    const [isOpen, setIsOpen] = React.useState(false)
    const dateRange: DateRange | undefined = (filters.startDate || filters.endDate) ? {
        from: filters.startDate ?? undefined,
        to: filters.endDate ?? undefined,
    } : undefined

    const endYear = Math.max(now.getFullYear(), filters.year) + 1;
    const startYear = Math.min(1970, filters.year);
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => endYear - i);

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
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground ml-auto">
                            <ChevronsUpDown />
                        </Button>
                    </CollapsibleTrigger>
                </li>
            </ul>
            <CollapsibleContent className="flex flex-col gap-4">
                <ul className="flex items-center gap-2">
                    <li className="contents">
                        <ActivationTooltipWrapper pressed={filters.withAirDate}>
                            <Toggle
                                pressed={filters.withAirDate}
                                onPressedChange={(value) => setFilters({ withAirDate: value })}
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
                            value={filters.airDate}
                            onValueChange={(value) => { if (isAirDateModeValue(value)) { setFilters({ airDate: value }) } }}
                            disabled={!filters.withAirDate}
                        >
                            {airDateModeOptions.map((option) => (
                                <ToggleGroupItem key={option.value} value={option.value} className="w-23 capitalize">
                                    {option.icon && <option.icon />} {option.label}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </li>
                    <li className="flex items-center gap-2">
                        {filters.airDate === AirDateMode.Period && (
                            <>
                                <Select value={filters.year.toString()} onValueChange={(value) => setFilters({ year: parseInt(value, 10) })} disabled={!filters.withAirDate}>
                                    <SelectTrigger className="w-20.5 font-medium">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-64 w-[--radix-select-trigger-width] min-w-[--radix-select-trigger-width]">
                                        {years.map((year) => (
                                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {category === Category.Anime && (
                                    <Select value={filters.season} onValueChange={(value) => { if (isSeasonValue(value)) { setFilters({ season: value }) } }} disabled={!filters.withAirDate}>
                                        <SelectTrigger className="w-25.5 font-medium">
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
                        {filters.airDate === AirDateMode.Range && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant="outline"
                                        disabled={!filters.withAirDate}
                                    >
                                        {dateRange && dateRange.from && dateRange.to ? (
                                            `${format(dateRange.from, "MMM dd, y")} ~ ${format(dateRange.to, "MMM dd, y")}`
                                        ) : (
                                            <span className="text-muted-foreground">from ... to ...</span>
                                        )}
                                        <CalendarIcon />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={(range) => setFilters({
                                            startDate: range?.from,
                                            endDate: range?.to,
                                        })}
                                        endMonth={filters.year !== 0 ? new Date(new Date().getFullYear(), new Date().getMonth() + 6) : undefined}
                                        numberOfMonths={2}
                                        captionLayout="dropdown"
                                        hideWeekdays
                                        className="rounded-lg shadow-sm"
                                        disabled={!filters.withAirDate}
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    </li>
                </ul>
                <ul className="flex h-7 items-center gap-2">
                    <li className="contents">
                        <ActivationTooltipWrapper pressed={filters.withRating}>
                            <Toggle
                                pressed={filters.withRating}
                                onPressedChange={(value) => setFilters({ withRating: value })}
                                className="mr-1"
                            >
                                <Star className="text-muted-foreground" />
                            </Toggle>
                        </ActivationTooltipWrapper>
                    </li>
                    <li className="flex w-full max-w-3xs items-center gap-2 ml-2">
                        <Label className="text-xs text-muted-foreground tabular-nums">
                            {filters.rating.at(0)?.toFixed(1)}
                        </Label>
                        <Slider
                            value={filters.rating}
                            onValueChange={(value) => setFilters({ rating: value })}
                            min={1}
                            max={9.9}
                            step={0.1}
                            disabled={!filters.withRating}
                        />
                        <Label className="text-xs text-muted-foreground tabular-nums">
                            {filters.rating.at(1)?.toFixed(1)}
                        </Label>
                    </li>
                </ul>
                <ul className="flex gap-2">
                    <li className="contents">
                        <ActivationTooltipWrapper pressed={filters.withTag}>
                            <Toggle
                                pressed={filters.withTag}
                                onPressedChange={(value) => setFilters({ withTag: value })}
                                className="mr-1"
                            >
                                <Tag className="text-muted-foreground" />
                            </Toggle>
                        </ActivationTooltipWrapper>
                    </li>
                    <li className="mt-0.5">
                        <TagArea
                            suggestedTags={isLoading ? [] : suggestedTags}
                            disabled={!filters.withTag}
                        />
                    </li>
                </ul>
            </CollapsibleContent>
        </Collapsible >
    )
}
