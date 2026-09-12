import { object, z } from "zod"

export const createProductSchema = z.object({
    categoryId: z.number().int().positive(),
    name: z.string().min(1),
    brand: z.string().min(1),
    description: z.string().optional(),
    price: z.number().positive(),
    stockQuantity: z.number().int().nonnegative(),
    imageUrl: z.url().optional()
})

export const updateProductSchema = z.object({
    name: z.string().min(1).optional(),
    price: z.number().positive().optional(),
    description: z.string().optional(),
    imageUrl: z.url().optional(),
    stockQuantity: z.number().int().nonnegative().optional(),
    categoryId: z.number().int().positive().optional()
}).refine(
    data => Object.keys(data).length > 0,
    {
        message: "At least one field must be provided"
    }
)

export const productIdSchema = z.coerce.number().int().positive()