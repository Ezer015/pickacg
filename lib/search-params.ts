import { z } from 'zod'

import { AirDateMode, Season } from '@/lib/constants'

export const airDateSchema = z.intersection(
    z.object({
        enable: z.boolean(),
    }),
    z.discriminatedUnion('mode', [
        // Period
        z.object({
            mode: z.literal(AirDateMode.Period),
            year: z.int(),
            season: z.enum(Object.values(Season)),
        }),
        // Range
        z.object({
            mode: z.literal(AirDateMode.Range),
            from: z.iso.date().optional(),
            to: z.iso.date().optional(),
        })
    ])
).refine((data) => {
    if (data.mode === AirDateMode.Range && data.from && data.to) {
        return data.from <= data.to
    }
    return true
}, {
    message: "From date must be before or equal to To date",
    path: ["from", "to"],
})

export const ratingSchema = z.object({
    enable: z.boolean(),
    min: z.number().min(0).max(10),
    max: z.number().min(0).max(10),
}).refine((data) => data.min <= data.max, {
    message: "Min must be less than or equal to Max",
    path: ["min"],
})

export const tagSchema = z.object({
    enable: z.boolean(),
    tags: z.array(z.string()),
})
