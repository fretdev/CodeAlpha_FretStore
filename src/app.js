import express from 'express'

const app = express()

app.use(express.json())
app.use(express.static("public"))

app.post("/form",(req,res)=>{
    const {username,password} = req.body

    console.log(`User logged in with: ${username}`)
    return res.json({
        username,
        password
    })
})


export default app