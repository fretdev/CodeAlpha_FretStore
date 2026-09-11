import { authenticate } from "../middleware/authenticate.js"
import { authorize } from "../middleware/authorize.js"
import { validateCreateProduct } from "../middleware/validate.js"
import { getProducts,getProduct,createProductController } from "../controllers/products.controller.js";


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
export default router