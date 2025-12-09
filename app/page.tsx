import * as React from "react"
import { HomeContent } from "@/components/home-content"

export default function Home() {
    return (
        <React.Suspense>
            <HomeContent now={new Date()} />
        </React.Suspense>
    )
}
