import { registerUser, findUserByEmail } from "../services/auth.service.js";
import bcrypt from "bcrypt"
import { generateToken } from "../utils/jwt.js";

export const register = async (req,res)=>{
    try{
        const {username,email,password} = req.body

        const user = await registerUser(username,email,password)

        res.status(201).json(user)
    } catch (error) {
    console.error("Registration error:",error)
    if(error.code === "23505" && error.constraint === "users_email_key"){
        return res.status(409).json({
            message: "Email already exists"
        })
    }

    res.status(500).json({
        message: "Failed to register user"
    })
}
}

export const login = async (req,res) => {
    try{
        const {email,password} = req.body

        const user = await findUserByEmail(email)

        if(!user){
            return res.status(401).json({
                message: "Invalid email or password"
            })
        }

        const passwordMatch = await bcrypt.compare(password,user.password)

        if(!passwordMatch){
            return res.status(401).json({
                message: "Invalid email or password"
            })
        }
        const token = generateToken(user)

        res.status(200).json({
            message: "Login successful",
            token
        })
    } catch(error){
        console.error("Login error:",error)

        res.status(500).json({
            message: "Failed to login user"
        })
    }
}
export const getMe = (req,res)=>{
    res.status(200).json({
        userId: req.user.userId,
        role: req.user.role
    })
}