import { registerSchema,loginSchema } from "../validators/auth.validator.js"
import { addCartItemSchema, cartItemIdSchema, updateCartItemSchema } from "../validators/cart.validator.js"
import { updateOrderStatusSchema } from "../validators/order.validator.js"
import { createProductSchema, updateProductSchema,productIdSchema} from "../validators/product.validator.js"

export const validateRegister = (req,res,next) =>{
    const result = registerSchema.safeParse(req.body)

    if (!result.success){
        return res.status(400).json({
            message: "Invalid registration data",
            errors: result.error.issues,
        })
    }
    next()
}

export const validateLogin = (req,res,next) =>{
    const result = loginSchema.safeParse(req.body)

    if(!result.success){
        return res.status(400).json({
            message: "Invalid login data",
            errors: result.error.issues
        })
    }
    next()
}

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

export const validateCreateProduct = (req,res,next) =>{
    const result = createProductSchema.safeParse(req.body)

    if(!result.success){
        return res.status(400).json({
            message: "Invalid product data",
            errors: result.error.issues
        })
    }

    next()
}

export const validateUpdateProduct = (req,res,next) =>{
    const result = updateProductSchema.safeParse(req.body)

    if(!result.success){
        return res.status(400).json({
            message: "Invalid product data",
            errors: result.error.issues
        })
    }
    next()
}

export const validateProductId = (req,res,next) =>{
    const result = productIdSchema.safeParse(req.params.id)
    if(!result.success){
       return res.status(400).json({
            message: "Invalid product ID",
            errors: result.error.issues
        })
    }
    req.params.id = result.data
    next()
}

export const validateUpdateOrderStatus = (req,res,next)=>{
    const result = updateOrderStatusSchema.safeParse(req.body)

    if(!result.success){
        res.status(400).json({
            message: "Invalid status update",
            errors: result.error.issues
        })
    }
    next()
}