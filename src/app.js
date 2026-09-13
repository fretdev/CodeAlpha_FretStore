import express from 'express'
import productsRouter from "./features/products/products.routes.js"
import categoriesRouter from "./features/categories/categories.routes.js"
import authRouter from "./features/auth/auth.routes.js"
import cartRouter from "./features/cart/cart.routes.js"
import orderRouter from "./features/orders/order.routes.js"
const app = express()

app.use(express.json())
app.use(express.static("public"))


app.use("/api/products",productsRouter)

app.use("/api/categories",categoriesRouter)

app.use("/api/auth",authRouter)

app.use("/api/cart",cartRouter)

app.use("/api/orders",orderRouter)

export default app