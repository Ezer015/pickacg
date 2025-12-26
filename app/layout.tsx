import type { Metadata } from "next"
import { Geist, Geist_Mono, Noto_Sans_SC, Noto_Sans_JP } from "next/font/google"
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

const notoSansSC = Noto_Sans_SC({
    variable: "--font-noto-sans-sc",
    subsets: ["latin"],
    display: "swap",
})

const notoSansJP = Noto_Sans_JP({
    variable: "--font-noto-sans-jp",
    subsets: ["latin"],
    display: "swap",
})

export const metadata: Metadata = {
    title: "PickACG",
    description: "Provide a better Bangumi search experience",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} ${notoSansSC.variable} ${notoSansJP.variable} antialiased`}>
                <NuqsAdapter>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        {children}
                        <Toaster />
                    </ThemeProvider>
                </NuqsAdapter>
                <Analytics />
            </body>
        </html>
    )
}
