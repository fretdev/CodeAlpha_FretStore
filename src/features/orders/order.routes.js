import Router from "express"
import { authenticate } from "../../middleware/authenticate.js"
import { authorize } from "../../middleware/authorize.js"
import { validateOrderId,validateUpdateOrderStatus } from "./order.middleware.js"
import { createOrderController,getOrderByIdController,getOrdersController,getAllOrdersController,getAdminOrderByIdController,updateOrderStatusController, cancelOrderController } from "./order.controller.js"

const router = Router()

router.post("/",
    authenticate,
    createOrderController
)

router.get("/admin",
    authenticate,
    authorize("admin"),
    getAllOrdersController
)

router.get("/admin/:id",
    authenticate,
    authorize("admin"),
    validateOrderId,
    getAdminOrderByIdController
)

router.patch("/admin/:id",
    authenticate,
    authorize("admin"),
    validateOrderId,
    validateUpdateOrderStatus,
    updateOrderStatusController
)

router.patch("/:id/cancel",
    authenticate,
    validateOrderId,
    cancelOrderController
)

router.get("/",
    authenticate,
    getOrdersController
)

router.get("/:id",
    authenticate,
    validateOrderId,
    getOrderByIdController
)


export default router