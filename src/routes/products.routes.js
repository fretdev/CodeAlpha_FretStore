import { authenticate } from "../middleware/authenticate.js"
import { authorize } from "../middleware/authorize.js"
import { validateCreateProduct, validateUpdateProduct } from "../middleware/validate.js"
import { getProducts,getProduct,createProductController,updateProductController } from "../controllers/products.controller.js";


import { Router } from "express";

const router = Router()

router.get("/",getProducts)

router.get("/:id",getProduct)

router.post("/",
    authenticate,
    authorize("admin"),
    validateCreateProduct,
    createProductController
)

router.patch('/:id',
    authenticate,
    authorize("admin"),
    validateUpdateProduct,
    updateProductController
)
export default router