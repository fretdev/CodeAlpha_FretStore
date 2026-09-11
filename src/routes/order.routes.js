import Router from "express"
import { authenticate } from "../middleware/authenticate.js"
import { createOrderController,getOrderByIdController,getOrdersController } from "../controllers/order.controller.js"

const router = Router()


router.post("/",
    authenticate,
    createOrderController
)

router.get("/",
    authenticate,
    getOrdersController
)

router.get("/:id",
    authenticate,
    getOrderByIdController
)
export default router