import pool from "../../config/db.js"

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

export const editProduct = async (productId,updates)=>{
    let fields = []
    let values = []
    let index = 1

    if(updates.name !== undefined){
        fields.push(`name = $${index}`)
        values.push(updates.name)
        index++
    }
    if(updates.price !== undefined){
        fields.push(`price = $${index}`)
        values.push(updates.price)
        index++
    }
    if(updates.description !== undefined){
        fields.push(`description = $${index}`)
        values.push(updates.description)
        index++
    }
    if(updates.imageUrl !== undefined){
        fields.push(`image_url = $${index}`)
        values.push(updates.imageUrl)
        index++
    }
    if(updates.stockQuantity !== undefined){
        fields.push(`stock_quantity = $${index}`)
        values.push(updates.stockQuantity)
        index++
    }
    if(updates.categoryId !== undefined){
        fields.push(`category_id = $${index}`)
        values.push(updates.categoryId)
        index++
    }
    values.push(productId)

    const productResult = await pool.query(`
            UPDATE products
            SET ${fields.join(",")}
            WHERE id = $${index}
        `,values)
    return productResult.rowCount
}


export const deleteProduct = async (productId)=>{
    const result = await pool.query(`
            DELETE FROM products
            WHERE id = $1
        `,[productId])
    return result.rowCount
}