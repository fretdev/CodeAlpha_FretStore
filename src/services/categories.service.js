import pool from "../config/db.js";

export const getAllCategories = async ()=>{
    const result = await pool.query(`
                SELECT
                    id,
                    name
                FROM categories
                ORDER BY id;
            `);
    return result.rows;
}
