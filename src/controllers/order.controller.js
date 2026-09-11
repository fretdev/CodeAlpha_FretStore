import { createOrder, getOrdersByUserId, getOrderById} from "../services/order.service.js";

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

export const getOrdersController = async (req,res) =>{
    try{
        const userId = req.user.userId

        const orders = await getOrdersByUserId(userId)

        res.status(200).json(orders)
    } catch(error){
        console.error("Failed to retrieve orders:",error.message)

        res.status(500).json({
            message: "Failed to retrieve orders"
        })
    }
}

export const getOrderByIdController = async (req,res)=>{
    try{
        const userId = req.user.userId
        const orderId = req.params.id

        const order = await getOrderById(userId,orderId)

        if(!order){
            return res.status(404).json({
                message: "Order not found"
            })
        }

        res.status(200).json(order)
    } catch(error){
        console.error("Failed to retrieve order:",error.message)
        res.status(500).json({
            message: "Failed to retrieve order"
        })
    }
}