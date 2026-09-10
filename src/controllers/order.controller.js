import { createOrder } from "../services/order.service.js";

export const createOrderController = async (req,res)=>{
    try{
        const userId = req.user.userId

        const orderId = await createOrder(userId)

        res.status(201).json({
            message: "Order created successfully",
            orderId
        })
    } catch(error){
        console.error("Order creation failed:",error.message)
        if(error.message === "Cart not found" || error.message === "Cart is empty"){
           return res.status(404).json({
                message: error.message
            })
        }
        if(error.message === "Insufficient stock"){
            return res.status(400).json({
                message: error.message
            })
        }
        res.status(500).json({
            message: "Failed to create order"
        })
    }
}