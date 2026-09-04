import pool from "../config/db.js"

export const getAllProducts = async () =>{
    const result = await pool.query(`
            SELECT
                products.id,
                products.name,
                products.brand,
                products.description,
                products.price,
                products.stock_quantity,
                products.image_url,
                categories.name AS category
            FROM products
            JOIN categories
                ON products.category_id = categories.id
            ORDER BY products.id;    
        `);

        return result.rows;
}

export const getProductById = async (id) =>{
    const result = await pool.query(`
            SELECT
                products.id,
                products.name,
                products.brand,
                products.description,
                products.price,
                products.stock_quantity,
                products.image_url,
                categories.name AS category
            FROM products
            JOIN categories
                ON products.category_id = categories.id
            WHERE products.id = $1;
        `,[id]);

        return result.rows[0]
}