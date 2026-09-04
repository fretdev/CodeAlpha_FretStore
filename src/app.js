import express from 'express'
import getProductsRouter from "./routes/products.routes.js"

const app = express()

app.use(express.json())
app.use(express.static("public"))


app.use("/api/products",getProductsRouter)



export default app