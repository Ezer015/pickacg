"use client"

import useSWR from "swr"
import Image from "next/image"
import Link from "next/link"
import { User, LogOut } from "lucide-react"
import { SiGithub } from "react-icons/si"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { activityOf } from "@/app/actions"

export function NavigationBar({ className, ...props }: React.ComponentProps<'ul'>) {
    const user = authClient.useSession().data?.user

    const { data, isLoading, error } = useSWR(
        user?.email ? ['activity', user.email] as const : null,
        ([, identifier]) => activityOf(identifier)
    );
    const activities = Object.entries(data || {}).sort(([a], [b]) => a.localeCompare(b))
    const activeDays = activities.map(([, count]) => count).filter((count: number) => count > 0).sort((a: number, b: number) => a - b)

    return (
        <ul className={cn("sticky top-0 z-20 flex w-full items-center bg-background/90 backdrop-blur px-6 py-3 justify-between", className)} {...props}>
            <li className="flex items-center gap-3">
                <Image
                    className="dark:invert"
                    src="/pickacg.svg"
                    alt="PickACG logo"
                    width={36}
                    height={36}
                    priority
                />
                <h1 className="text-xl font-bold leading-tight">
                    PickACG
                </h1>
            </li>
            <li /> {/* Placeholder */}
            <li className="flex items-center gap-4">
                <Button variant="outline" size="icon-sm" asChild>
                    <Link
                        href="https://github.com/Ezer015/pickacg/"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <SiGithub />
                    </Link>
                </Button>
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon-sm" className="focus-visible:ring-0">
                                <Avatar>
                                    <AvatarImage src={user.image || ""} alt={user.name || ""} />
                                    <AvatarFallback>{user.name?.at(0) || "U"}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="mt-1" align="end">
                            <DropdownMenuLabel className="flex gap-1.5">
                                <span className="font-medium">{user.name}</span>
                                <span className="text-muted-foreground">@{user.email}</span>
                            </DropdownMenuLabel>
                            <ol className="flex gap-1 px-2 pb-1.5">
                                {!error && (isLoading
                                    ? Array.from({ length: 7 }).map((_, i) => (
                                        <Skeleton key={`skeleton-${i}`} className="size-3.5 rounded-full" />
                                    ))
                                    : activities.reverse().map(([date, count]) => (
                                        <li key={date} className={cn("size-3.5 rounded-full", {
                                            "bg-progress/80": activeDays[Math.floor(activeDays.length * 0.75)] <= count,
                                            "bg-progress/65": activeDays[Math.floor(activeDays.length * 0.50)] <= count && count < activeDays[Math.ceil(activeDays.length * 0.75)],
                                            "bg-progress/50": activeDays[Math.floor(activeDays.length * 0.25)] <= count && count < activeDays[Math.ceil(activeDays.length * 0.50)],
                                            "bg-progress/35": 0 < count && count < activeDays[Math.floor(activeDays.length * 0.25)],
                                            "bg-progress/20": count === 0,
                                        })} />
                                    ))
                                )}
                            </ol>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="justify-between text-muted-foreground"
                                onClick={async () => await authClient.signOut()}
                            >
                                Log Out<LogOut />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon-sm"
                                    onClick={async () => await authClient.signIn.oauth2({
                                        providerId: "bangumi",
                                        callbackURL: window.location.href,
                                    })}
                                >
                                    <User />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <span className="font-medium">Login</span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </li>
        </ul>
    )
}
