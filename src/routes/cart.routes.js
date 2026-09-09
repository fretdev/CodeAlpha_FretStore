import {Router} from "express"
import { authenticate } from "../middleware/authenticate.js"
import { getCart } from "../controllers/cart.controller.js"

const router = Router ()


router.get("/",authenticate,getCart)

export default router

