import { getCartByUserId,addToCart,updateCartItem, removeCartItem } from "../services/cart.service.js";

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

export const addCartItem = async (req,res)=>{
    try{
        const userId = req.user.userId
        const {productId,quantity} = req.body

        const cartItem = await addToCart(userId,productId,quantity)

        res.status(200).json(cartItem)
    } catch (error){
        console.error("Failed to add item to cart:",error.message)

        if(error.message === "Product not found"){
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
            message: "Failed to add iterm to cart"
        })
    }
}

export const updateCartItemController = async (req,res) => {
    try{
        const userId = req.user.userId
        const {quantity} = req.body
        const cartItemId = Number(req.params.id)

        const cartItem = await updateCartItem(userId,cartItemId,quantity)

        res.status(200).json(cartItem)
    } catch(error){
        console.error("Failed to update cart item:",error.message)
        if(error.message === "Insufficient stock"){
            return res.status(400).json({
                message: error.message
            })
        }
        if(error.message === "Product not found"){
            return res.status(404).json({
                message: error.message
            })
        }
        res.status(500).json({
            message: "Failed to update cart item"
        })

    }
}

export const removeCartItemController = async (req,res) => {
    try{
        const userId = req.user.userId
        const cartItemId = req.params.id

        const deletedItem = await removeCartItem(userId,cartItemId)

        if(!deletedItem){
            return res.status(404).json({
                message: "Cart item not found"
            })
        }
        res.status(200).json(deletedItem)
    } catch(error){
        console.error("Failed to delete cart_item",error.message)

        res.status(500).json({
            message: "Failed to delete cart  item"
        })
    }
}