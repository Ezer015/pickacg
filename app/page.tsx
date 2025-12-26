import * as React from "react"
import { HomeContent } from "@/app/content"

import { NavigationBar } from "@/components/navigation-bar"

export default function Home() {
    return (
        <React.Suspense>
            <div className="flex min-h-screen items-center justify-center font-sans">
                <main className="flex min-h-screen w-full max-w-400 flex-col items-center gap-6 py-2 px-4 sm:py-6 sm:px-12 sm:items-start">
                    <NavigationBar />
                    <HomeContent />
                </main>
            </div>
        </React.Suspense>
    )
}
