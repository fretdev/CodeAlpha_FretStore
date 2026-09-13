import {Router} from "express"
import { authenticate } from "../../middleware/authenticate.js"
import { addCartItem, getCart, removeCartItemController, updateCartItemController } from "./cart.controller.js"
import { validateAddCartItem, validateCartItemId, validateUpdateCartItem} from "./cart.middleware.js"

const router = Router ()


router.get("/",authenticate,getCart)

router.post("/items",authenticate,validateAddCartItem,addCartItem)

router.patch("/items/:id",
    authenticate,
    validateUpdateCartItem,
    updateCartItemController
)

router.delete("/items/:id",
    authenticate,
    validateCartItemId,
    removeCartItemController
)


export default router

