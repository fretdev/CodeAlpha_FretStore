import { addCartItemSchema,updateCartItemSchema,cartItemIdSchema } from "./cart.schema.js"

export const validateAddCartItem = (req,res,next) => {
    const result = addCartItemSchema.safeParse(req.body)

    if(!result.success){
        return res.status(400).json({
            message: "Invalid cart item data",
            errors: result.error.issues
        })
    }
    next()
}

export const validateUpdateCartItem = (req,res,next) => {
    const result = updateCartItemSchema.safeParse(req.body)

    if(!result.success){
        return res.status(400).json({
            message: "Invalid cart item data",
            errors: result.error.issues
        })
    }
    next()
}

export const validateCartItemId = (req,res,next) => {
    const result = cartItemIdSchema.safeParse(req.params.id)

    if(!result.success){
        return res.status(400).json({
            message: "Invalid cart item ID",
            errors: result.error.issues
        })
    }
    req.params.id = result.data
    next()
}
