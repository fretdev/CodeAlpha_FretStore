import { z } from "zod"

export const updateOrderStatusSchema = z.object({
    status: z.enum([
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled'
    ])
})