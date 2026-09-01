import "dotenv/config"
import app from "./app.js"
import pool from "./config/db.js"

const PORT = process.env.PORT


const startServer = async ()=>{
    try{
        await pool.query("SELECT NOW()")
        console.log("Database connected successfully")

        app.listen(PORT,()=>{
            console.log(`Server is running on port: ${PORT}`)
        })
    }
    catch(error){
        console.log("Database connection failed",error.message)
        process.exit(1)
    }
}
startServer()