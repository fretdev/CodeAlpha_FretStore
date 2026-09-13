import { updateOrderStatusSchema,orderIdSchema } from "./order.schema.js"

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

export const validateOrderId = (req,res,next)=>{
    const result = orderIdSchema.safeParse(req.params.id)

    if(!result.success){
       return res.status(400).json({
            message: "Invalid order ID"
        })
    }

    req.params.id = result.data

    next()
}