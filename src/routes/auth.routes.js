import {Router} from "express"
import { register, login, getMe } from "../controllers/auth.controller.js"
import { validateRegister,validateLogin } from "../middleware/validate.js"
import {authenticate} from "../middleware/authenticate.js"

const router = Router()


router.post("/register",
    validateRegister,
    register
)

router.post("/login",
    validateLogin,
    login
)

router.get("/me",authenticate,getMe)

export default router