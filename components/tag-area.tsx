"use client"

import * as React from "react"
import { useQueryState, parseAsJson } from "nuqs"
import { Plus, X } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Kbd } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"

import { tagSchema } from "@/lib/search-params"

export function TagArea({
    className,
    suggestedTags = [],
    disabled = false,
    ...props
}: React.ComponentProps<'ul'> & {
    suggestedTags?: string[]
    disabled?: boolean
}) {
    // Sync states with URL query parameter
    const [tagFilter, setTagFilter] = useQueryState('tags', parseAsJson(tagSchema).withDefault({ enable: false, tags: [] }))

    const [inputValue, setInputValue] = React.useState<string>("")
    const [open, setOpen] = React.useState(false)
    const availableTags = suggestedTags.filter((tag) => !tagFilter.tags.includes(tag))

    const handleAddTag = (tag: string) => {
        if (!tag) { return false }
        if (tagFilter.tags.includes(tag)) {
            toast.error(`Tag "${tag}" already exists.`, { position: "top-center" })
            return false
        }

        setTagFilter({ ...tagFilter, tags: [...tagFilter.tags, tag] })
        return true
    }
    const handleRemoveTag = (tagToRemove: string) => {
        setTagFilter({ ...tagFilter, tags: tagFilter.tags.filter((tag) => tag !== tagToRemove) })
        return true
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (handleAddTag(inputValue.trim())) {
            setInputValue("")
        }
        return true
    }

    return (
        <ul className={cn("flex w-full gap-2 flex-wrap items-center", className)} {...props}>
            {tagFilter.tags.map((tag) => (
                <li key={tag} className="contents">
                    <Badge
                        variant="secondary"
                        className={cn("text-sm", { "opacity-50": disabled })}
                    >
                        {tag}
                        <Button
                            variant="ghost"
                            size="icon-5xs"
                            className="rounded-full text-muted-foreground hover:text-foreground"
                            onClick={() => handleRemoveTag(tag)}
                            disabled={disabled}
                        >
                            <X />
                        </Button>
                    </Badge>
                </li>
            ))}

            <li className="contents">
                <Popover open={open} onOpenChange={setOpen}>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon-sm"
                                        className="rounded-full border-dashed text-xs font-normal text-muted-foreground hover:text-foreground hover:border-transparent"
                                        disabled={disabled}
                                    >
                                        <Plus />
                                    </Button>
                                </PopoverTrigger>
                            </TooltipTrigger>
                            {!open && <TooltipContent side="right">Add a Tag</TooltipContent>}
                        </Tooltip>
                    </TooltipProvider>

                    <PopoverContent className="w-fit p-2 flex flex-col gap-3" align="start" side="bottom" sideOffset={10}>
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <InputGroup className="flex-1">
                                <InputGroupInput
                                    placeholder="tag..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    autoFocus
                                />
                                <InputGroupAddon align="inline-end">
                                    <InputGroupButton type="submit" variant="secondary" disabled={disabled || !inputValue.trim()}>
                                        Add <Kbd>⏎</Kbd>
                                    </InputGroupButton>
                                </InputGroupAddon>
                            </InputGroup>
                        </form>
                        {availableTags.length > 0 && (
                            <ul className="flex w-full max-w-xs gap-2 flex-wrap">
                                {availableTags.map((tag) => (
                                    <li key={tag} className="contents">
                                        <Badge variant="secondary" className="text-sm">
                                            {tag}
                                            <Button
                                                variant="ghost"
                                                size="icon-5xs"
                                                className="rounded-full text-muted-foreground hover:text-foreground"
                                                onClick={() => handleAddTag(tag)}
                                            >
                                                <Plus />
                                            </Button>
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </PopoverContent>
                </Popover>
            </li>
        </ul >
    )
}
