import Image from "next/image"
import Link from "next/link"
import { SiGithub } from "react-icons/si"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function NavigationBar({ className, ...props }: React.ComponentProps<'ul'>) {
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
            <li className="contents">
                <Button variant="ghost" size="icon" asChild>
                    <Link
                        href="https://github.com/Ezer015/pick-anime-cool"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <SiGithub className="size-5" />
                    </Link>
                </Button>
            </li>
        </ul>
    )
}
