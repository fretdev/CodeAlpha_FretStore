import { getProducts,getProduct,createProductController,updateProductController,deleteProductController } from "./products.controller.js"
import { authenticate } from "../../middleware/authenticate.js"
import { authorize } from "../../middleware/authorize.js"
import { validateCreateProduct,validateProductId,validateUpdateProduct} from "./product.middleware.js"

import { Router } from "express";

const router = Router()

router.get("/",getProducts)

router.get("/:id",validateProductId,getProduct)

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



export default router