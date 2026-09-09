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
        `,[userId])

    let cart = cartResult.rows[0]

    if(!cart){
        cartResult = await pool.query(`
                INSERT INTO carts (user_id)
                VALUES ($1)
                RETURNING id;
            `,[userId])
        cart = cartResult.rows[0]
    }
   
    const existingItemResult = await pool.query(`
            SELECT id,quantity
            FROM cart_items
            WHERE cart_id = $1
            AND product_id = $2;
        `,[cart.id,productId])

    const existingItem = existingItemResult.rows[0]

    if(existingItem){
        const newQuantity = existingItem.quantity + quantity

        if(newQuantity > product.stock_quantity){
            throw new Error("Insufficient stock")
        }

        const result = await pool.query(`
                UPDATE cart_items
                SET quantity = $1
                WHERE id = $2
                RETURNING *;
            `,[newQuantity,existingItem.id])

        return result.rows[0]
    }

    const result = await pool.query(`
            INSERT INTO cart_items (cart_id,product_id,quantity)
            VALUES ($1,$2,$3)
            RETURNING *;
        `,[cart.id,productId,quantity])

    return result.rows[0]
}

export const updateCartItem = async (userId,cartItemId,quantity) => {
    const productIdResult = await pool.query(`
            SELECT product_id
            FROM cart_items
            WHERE id =$1
        `,[cartItemId])
    const productIdRow = productIdResult.rows[0]
    if(!productIdRow){
        throw new Error("Cart item not found")
    }

    const productId = productIdRow.product_id

    const productResult = await pool.query(`
            SELECT id,name,stock_quantity
            FROM products
            WHERE id = $1
        `,[productId])

    const product = productResult.rows[0]

        if(!product){
            throw new Error("Product not found")
        }
        if(quantity > product.stock_quantity){
            throw new Error("Insufficient Stock")
        }

    const result = await pool.query(`
            UPDATE cart_items
            SET quantity = $1
            WHERE id = $2
            AND cart_id IN (
                SELECT id
                FROM carts
                WHERE user_id = $3
            )
            RETURNING *;
        `,[quantity,cartItemId,userId])

    return result.rows[0]
}

export const removeCartItem = async (userId,cartItemId) =>{
    const result = await pool.query(`
            DELETE FROM cart_items
            WHERE id = $1
            AND cart_id IN (
                SELECT id
                FROM carts
                WHERE user_id = $2
            )
            RETURNING *
        `,[cartItemId,userId])
    
    return result.rows[0]
}