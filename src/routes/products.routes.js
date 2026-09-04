import { getProducts,getProduct } from "../controllers/products.controller.js";

import { Router } from "express";

const router = Router()

router.get("/",getProducts)

router.get("/:id",getProduct)

export default router