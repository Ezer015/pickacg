import * as React from "react"
import { HomeContent } from "@/app/content"

export default function Home() {
    return (
        <React.Suspense>
            <HomeContent />
        </React.Suspense>
    )
}
