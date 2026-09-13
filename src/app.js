import express from 'express'
import productsRouter from "./routes/products.routes.js"
import categoriesRouter from "./routes/categories.routes.js"
import authRouter from "./routes/auth.routes.js"
import cartRouter from "./routes/cart.routes.js"
import orderRouter from "./routes/order.routes.js"
import adminRouter from "./routes/admin.routes.js"
const app = express()

app.use(express.json())
app.use(express.static("public"))


app.use("/api/products",productsRouter)

app.use("/api/categories",categoriesRouter)

app.use("/api/auth",authRouter)

app.use("/api/cart",cartRouter)

app.use("/api/orders",orderRouter)

app.use("/api/admin",adminRouter)

export default app