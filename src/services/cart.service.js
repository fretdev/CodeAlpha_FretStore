import pool from "../config/db.js"

export const getCartByUserId = async (userId)=>{
    const result = await pool.query(`
            SELECT 
                cart_items.id,
                cart_items.product_id,
                cart_items.quantity,
                products.name,
                products.brand,
                products.price,
                products.image_url
            FROM carts
            JOIN cart_items
                ON carts.id  = cart_items.cart_id
            JOIN products
                ON cart_items.product_id = products.id
            WHERE carts.user_id = $1
            ORDER BY cart_items.id;
        `,[userId]);

        return result.rows;
}

export const addToCart = async (userId,productId,quantity) => {
    const productResult = await pool.query(`
            SELECT id,name,stock_quantity
            FROM products
            WHERE id = $1
        `,[productId]);

    const product = productResult.rows[0]

    if(!product){
        throw new Error("Product not found")
    }
    if(product.stock_quantity < quantity){
        throw new Error("Insufficient stock")
    }

    let cartResult = await pool.query(`
            SELECT id
            FROM carts
            WHERE user_id = $1
        `[userId])

    let cart = cartResult.rows[0]

    if(!cart){
        cartResult = await pool.query(`
                INSERT INTO carts (user_id)
                VALUES ($1)
                RETURNING id;
            `,[userId])
        cart = cartResult.rows[0]
    }
   
}