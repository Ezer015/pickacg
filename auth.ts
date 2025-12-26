import NextAuth from "next-auth"

const bangumiUrl = process.env.NEXT_PUBLIC_BANGUMI_URL
const apiUrl = process.env.API_URL

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        {
            id: "bangumi",
            name: "Bangumi",
            type: "oauth",
            authorization: {
                url: `${bangumiUrl}/oauth/authorize`,
                params: { scope: "" },
            },
            token: {
                url: `${bangumiUrl}/oauth/access_token`,
                // Fix Bangumi returning null scope
                async conform(response: Response) {
                    const body = await response.clone().json()
                    // Convert null scope to empty string
                    body.scope = body.scope ?? ""
                    return new Response(JSON.stringify(body), {
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers,
                    })
                },
            },
            userinfo: `${apiUrl}/p1/me`,
            clientId: process.env.AUTH_BANGUMI_ID,
            clientSecret: process.env.AUTH_BANGUMI_SECRET,
            profile(profile) {
                return {
                    id: profile.id.toString(),
                    name: profile.nickname,
                    image: profile.avatar?.medium,
                }
            },
        },
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token
            }
            return token
        },
        async session({ session, token }) {
            if (token?.accessToken) {
                session.accessToken = token.accessToken;
            }
            return session
        },
    },
})

