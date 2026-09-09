import {Router} from "express"
import { authenticate } from "../middleware/authenticate.js"
import { addCartItem, getCart, removeCartItemController, updateCartItemController } from "../controllers/cart.controller.js"
import { validateAddCartItem, validateCartItemId, validateUpdateCartItem} from "../middleware/validate.js"

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

