import express from 'express'
import productsRouter from "./routes/products.routes.js"
import categoriesRouter from "./routes/categories.routes.js"
import authRouter from "./routes/auth.routes.js"

const app = express()

app.use(express.json())
app.use(express.static("public"))


app.use("/api/products",productsRouter)

app.use("/api/categories",categoriesRouter)

app.use("/api/auth",authRouter)



export default app