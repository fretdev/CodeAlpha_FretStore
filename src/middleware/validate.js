import { registerSchema,loginSchema } from "../validators/auth.validator.js"

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