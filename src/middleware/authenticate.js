import jwt from "jsonwebtoken"

export const authenticate = (req,res,next)=>{
    try{
        const authHeader = req.headers.authorization

        if(!authHeader){
            return res.status(401).json({
                message: "Authentication required"
            })
        }

        const token = authHeader.split(" ")[1]

        if(!token){
            return res.status(401).json({
                message: "Authentication required"
            })
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        console.log("Decoded token:",decoded)
        req.user = decoded
        next()
    } catch(error){
        console.error("Authentication error:",error)

        return res.status(401).json({
            message: "Invalid or expired token"
        })
    }
}