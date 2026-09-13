import { createProductSchema,updateProductSchema,productIdSchema } from "./product.schema.js"

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