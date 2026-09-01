import express from 'express'
import cors from "cors"

const app = express()

app.use(express.json())

app.use(cors({
    origin: ["http://127.0.0.1:5500"]
}))

app.post("/form",(req,res)=>{
    const {username,password} = req.body

    console.log(`User logged in with: ${username}`)
    return res.json({
        username,
        password
    })
})


export default app