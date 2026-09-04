import { getProducts } from "../controllers/products.controller.js";

import { Router } from "express";

const router = Router()

router.get("/",getProducts)

export default router