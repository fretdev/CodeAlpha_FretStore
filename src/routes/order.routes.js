import Router from "express"
import { authenticate } from "../middleware/authenticate.js"
import { createOrderController } from "../controllers/order.controller.js"

const router = Router()


router.post("/",
    authenticate,
    createOrderController
)

export default router