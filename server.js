import express from 'express'
import cors from 'cors'

const app = express()
const port = 3000
const url = `localhost:${port}`

app.use(cors({
    origin: ["http://127.0.0.1:5500"]
}))

app.use(express.json())


app.post('/form',(req,res)=>{
    const {username,password} = req.body
    console.log(`Login successful with username: ${username} and pasword: ${password}`)
    return res.json(
        {username,
        password}
    )
})

app.listen(port,()=>{
    console.log(`Server is running on port: ${url}`)
})