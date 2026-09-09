import { getCartByUserId } from "../services/cart.service.js";

export const getCart = async (req,res)=>{
    try{
        const userId = req.user.userId

        const cart = await getCartByUserId(userId)

        res.status(200).json(cart)
    } catch(error){
        console.error("Failed to fetch cart:",error.message)

        res.status(500).json({
            message: "Failed to fetch cart"
        })
    }
}