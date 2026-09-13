import { authenticate } from "../middleware/authenticate.js"
import { authorize } from "../middleware/authorize.js"
import { validateCreateProduct, validateOrderId, validateProductId, validateUpdateOrderStatus, validateUpdateProduct} from "../middleware/validate.js"
import { createProductController,updateProductController,deleteProductController } from "../controllers/products.controller.js"
import { Router } from "express"
import { getAdminOrderByIdController, getAllOrdersController, updateOrderStatusController } from "../controllers/order.controller.js"
const router = Router()

router.post("/",
    authenticate,
    authorize("admin"),
    validateCreateProduct,
    createProductController
)

router.patch('/:id',
    authenticate,
    authorize("admin"),
    validateProductId,
    validateUpdateProduct,
    updateProductController
)

router.delete("/:id",
    authenticate,
    authorize("admin"),
    validateProductId,
    deleteProductController
)

router.get("/orders",
    authenticate,
    authorize("admin"),
    getAllOrdersController
)

router.get("/orders/:id",
    authenticate,
    authorize("admin"),
    getAdminOrderByIdController
)

router.patch("/orders/:id",
    authenticate,
    authorize("admin"),
    validateOrderId,
    validateUpdateOrderStatus,
    updateOrderStatusController
)
export default router