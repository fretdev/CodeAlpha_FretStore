import pool from "../config/db.js"
import bcrypt from "bcrypt"


export const registerUser = async (username,email,password)=>{
    const hashedPassword = await bcrypt.hash(password,10)

    const result = await pool.query(`
            INSERT INTO users (username,email,password)
            VALUEs ($1,$2,$3)
            RETURNING id,username,email,role,created_at;
        `,[username,email,hashedPassword]);
        
    return result.rows[0]
}

export const findUserByEmail = async (email) =>{
    const result = await pool.query(`
            SELECT
                id,
                username,
                email,
                password,
                role
            FROM users
            WHERE email = $1;
        `,[email])

    return result.rows[0]
}