"use client"

import Image from "next/image"
import Link from "next/link"
import { User, LogOut } from "lucide-react"
import { SiGithub } from "react-icons/si"

import { Button } from "@/components/ui/button"
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

export function NavigationBar({ className, ...props }: React.ComponentProps<'ul'>) {
    const user = authClient.useSession().data?.user

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
                            <DropdownMenuLabel className="flex flex-col">
                                <span className="font-medium">{user.name}</span>
                                <span className="text-muted-foreground">@{user.email}</span>
                            </DropdownMenuLabel>
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
