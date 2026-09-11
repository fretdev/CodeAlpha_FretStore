import { z } from "zod"

export const createProductSchema = z.object({
    categoryId: z.number().int().positive(),
    name: z.string().min(1),
    brand: z.string().min(1),
    description: z.string().optional(),
    price: z.number().positive(),
    stockQuantity: z.number().int().nonnegative(),
    imageUrl: z.url().optional()
})