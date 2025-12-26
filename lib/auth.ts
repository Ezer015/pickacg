import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";

const bangumiAuthId = process.env.BANGUMI_AUTH_ID
const bangumiAuthSecret = process.env.BANGUMI_AUTH_SECRET

const betterAuthUrl = process.env.BETTER_AUTH_URL
const bangumiUrl = process.env.NEXT_PUBLIC_BANGUMI_URL
const nextApiUrl = process.env.NEXT_API_URL

export const auth = betterAuth({
    plugins: [
        genericOAuth({
            config: [
                {
                    providerId: "bangumi",
                    clientId: bangumiAuthId!,
                    clientSecret: bangumiAuthSecret,
                    authorizationUrl: `https://${bangumiUrl}/oauth/authorize`,
                    tokenUrl: `https://${bangumiUrl}/oauth/access_token`,
                    redirectURI: `${betterAuthUrl}/api/auth/callback/bangumi`,
                    scopes: [],
                    getUserInfo: async (token) => {
                        const response = await fetch(`https://${nextApiUrl}/p1/me`, {
                            headers: { Authorization: `Bearer ${token.accessToken}` }
                        })
                        if (!response.ok) { return null }

                        const profile = await response.json()
                        return {
                            id: profile.id,
                            name: profile.nickname,
                            email: profile.username,
                            emailVerified: false,
                            image: profile.avatar?.large,
                        };
                    },
                }
            ]
        })
    ]
})
