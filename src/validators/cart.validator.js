import { z } from "zod"

export const addCartItemSchema = z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive()
})

export const updateCartItemSchema = z.object({
    quantity: z.number().int().positive()
})

export const cartItemIdSchema = z.coerce.number().int().positive()