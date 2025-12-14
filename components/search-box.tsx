"use client"

import * as React from "react"
import { useQueryStates, parseAsString, parseAsStringLiteral } from 'nuqs';
import { Search } from "lucide-react"

import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Kbd } from "@/components/ui/kbd"
import { Spinner } from "@/components/ui/spinner"

import { cn } from "@/lib/utils";
import { Category } from "@/lib/constants"
import { type Option } from "@/types/option"

type CategoryValue = typeof Category[keyof typeof Category];
const categoryValues = Object.values(Category);
// Type guard for CategoryValue
function isCategoryValue(value: string): value is CategoryValue {
    return categoryValues.includes(value as CategoryValue);
}
// Options for category select
const categoryOptions: Option[] = [
    {
        value: Category.Anime,
        label: "Anime"
    },
    {
        value: Category.Book,
        label: "Book"
    },
    {
        value: Category.Game,
        label: "Game"
    },
    {
        value: Category.Music,
        label: "Music"
    },
    {
        value: Category.Real,
        label: "Real"
    }
] as const


export function SearchBox({
    className,
    isLoading = false,
    ...props
}: {
    isLoading?: boolean,
} & React.ComponentProps<'form'>) {
    // Sync states with URL query parameters
    const [filters, setFilters] = useQueryStates({
        query: parseAsString.withDefault(''),
        category: parseAsStringLiteral(categoryValues).withDefault(Category.Anime),
    });

    const [queryInput, setQueryInput] = React.useState(filters.query)

    return (
        <form
            className={cn("flex w-full gap-2", className)}
            role="search"
            onSubmit={(e) => { e.preventDefault(); setFilters({ query: queryInput }) }}
            {...props}
        >
            <Select value={filters.category} onValueChange={(value) => { if (isCategoryValue(value)) { setFilters({ category: value }) } }}>
                <SelectTrigger className="w-[91px] shrink-0 capitalize font-medium">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-[--radix-select-trigger-width] min-w-[--radix-select-trigger-width]">
                    {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="capitalize">
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <InputGroup className="flex-1">
                <InputGroupInput
                    placeholder="search..."
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    disabled={isLoading}
                />
                <InputGroupAddon>
                    {isLoading ? <Spinner /> : <Search />}
                </InputGroupAddon>
                <InputGroupAddon align="inline-end">
                    <InputGroupButton type="submit" variant="secondary" disabled={isLoading}>
                        Search<Kbd>⏎</Kbd>
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>
        </form>
    )
}
