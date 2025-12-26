import Image from "next/image"
import Link from "next/link"
import { User } from "lucide-react"
import { SiGithub } from "react-icons/si"
import { signIn, signOut, auth } from "@/auth"

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
import { cn } from "@/lib/utils"

export async function NavigationBar({ className, ...props }: React.ComponentProps<'ul'>) {
    const session = await auth()

    return (
        <ul className={cn("sticky top-0 z-20 flex w-full items-center bg-background/90 backdrop-blur px-6 py-3 justify-between", className)} {...props}>
            <li className="flex items-center gap-3">
                <Image
                    className="dark:invert"
                    src="/pick-anime-cool.svg"
                    alt="Pick Anime Cool logo"
                    width={36}
                    height={36}
                    priority
                />
                <h1 className="text-xl font-bold leading-tight">
                    Pick Anime Cool
                </h1>
            </li>
            <li /> {/* Placeholder */}
            <li className="flex items-center gap-4">
                <Button variant="outline" size="icon-sm" asChild>
                    <Link
                        href="https://github.com/Ezer015/pick-anime-cool"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <SiGithub />
                    </Link>
                </Button>
                {session?.user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon-sm">
                                <Avatar>
                                    <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                                    <AvatarFallback>{session.user.name?.at(0) || "U"}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" forceMount>
                            <DropdownMenuLabel>{session.user.name}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={async () => {
                                "use server"
                                await signOut()
                            }}>
                                Log Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button variant="outline" size="icon-sm" onClick={async () => {
                        "use server"
                        await signIn("bangumi")
                    }}>
                        <User />
                    </Button>
                )}
            </li>
        </ul>
    )
}
