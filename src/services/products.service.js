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

export const createProduct = async(categoryId,name,brand,description,price,stockQuantity,imageUrl) =>{
    const productResult = await pool.query(`
            INSERT INTO products (category_id,name,brand,description,price,stock_quantity,image_url)
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING id
        `,[categoryId,name,brand,description,price,stockQuantity,imageUrl])

    return productResult.rows[0].id
}

export const editProduct = async (productId,name,price,description,imageUrl,stockQuantity,category)=>{
   const productResult = await pool.query(`
        UPDATE products
        SET name = $1,price = $2,description = $3,image_url = $4,stock_quantity = $5,category_id = $6
        WHERE id = $7
    `,[name,price,description,imageUrl,stockQuantity,category,productId])

    return productResult.rowCount
}