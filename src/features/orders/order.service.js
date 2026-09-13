import pool from "../../config/db.js"

export const createOrder = async (userId) =>{
    const client = await pool.connect()
   try{
        await client.query("BEGIN")

        const  cartResult = await client.query(`
            SELECT id
            FROM carts
            WHERE user_id = $1
        `,[userId])

        if(!cartResult.rows[0]){
            throw new Error("Cart not found")
        }
        
        const cartId = cartResult.rows[0].id

       const cartItemsResult = await client.query(`
            SELECT cart_items.product_id,cart_items.quantity,products.name,products.price,products.stock_quantity
            FROM carts
            JOIN cart_items
                ON carts.id = cart_items.cart_id
            JOIN products
                ON cart_items.product_id = products.id
            WHERE carts.id = $1
        `,[cartId])

       if(!cartItemsResult.rows[0]){
            throw new Error("Cart is empty")
       }

       const totalAmount = cartItemsResult.rows.reduce(
        (total,item)=>{
            return total + (item.quantity * item.price)
        },0
       )

       const orderResult = await client.query(`
            INSERT into orders (user_id,total_amount)
            VALUES ($1,$2)
            RETURNING id;
        `,[userId,totalAmount])

        const orderId = orderResult.rows[0].id

        const orderItems = cartItemsResult.rows.map((item)=>{
            return {
                order_id: orderId,
                product_id: item.product_id,
                product_name: item.name,
                unit_price: item.price,
                quantity: item.quantity
            }
        })
        for(const item of orderItems){
            await client.query(`
                INSERT INTO order_items (order_id,product_id,product_name,unit_price,quantity)
                VALUES ($1,$2,$3,$4,$5)
                RETURNING id;
            `,[item.order_id,item.product_id,item.product_name,item.unit_price,item.quantity])

            const stockResult = await client.query(`
                UPDATE products
                SET stock_quantity = stock_quantity - $1
                WHERE id = $2
                AND  stock_quantity >= $1;
            `,[item.quantity,item.product_id])

            if(stockResult.rowCount === 0){
                throw new Error("Insufficient stock")
            }
        }

        await client.query(`
                DELETE FROM cart_items
                WHERE cart_id = $1
            `,[cartId])
        await client.query("COMMIT")
        
        return orderId
   } catch(error){
    await client.query("ROLLBACK")
    console.error("Order failed",error.message)
    throw error
} finally{
    client.release()
}
}

export const getOrdersByUserId = async (userId) =>{
    const result = await pool.query(`
            SELECT id,status,total_amount,created_at
            FROM orders
            WHERE user_id = $1
            ORDER BY created_at DESC
        `,[userId])
    return result.rows
}

export const getOrderById = async (userId,orderId) =>{
    const orderResult = await pool.query(`
            SELECT id,status,total_amount,created_at
            FROM orders
            WHERE id = $1
            AND user_id = $2
        `,[orderId,userId])

    const order = orderResult.rows[0]

    if(!order){
        return null
    }

    const itemsResult = await pool.query(`
            SELECT product_id,product_name,unit_price,quantity
            FROM order_items
            WHERE order_id = $1
            ORDER BY id
        `,[orderId])

    return {
        ...order,
        items: itemsResult.rows
    }
}

export const getAllOrders = async ()=>{
    const result = await pool.query(`
            SELECT  orders.id,orders.user_id,users.username,users.email,orders.status,orders.total_amount,orders.created_at
            FROM orders
            JOIN users
                ON orders.user_id = users.id
        `)
    return result.rows
}

export const getAdminOrderById = async (orderId)=>{
    const orderResult = await pool.query(`
            SELECT orders.id,orders.user_id,users.username,users.email,orders.status,orders.total_amount,orders.created_at
            FROM orders
            JOIN users
                ON orders.user_id = users.id
            WHERE orders.id = $1
        `,[orderId])
    const order = orderResult.rows[0]
    if(!order){
        return null
    }

    const itemsResult = await pool.query(`
            SELECT id,product_id,product_name,unit_price,quantity
            FROM order_items
            WHERE order_items.order_id = $1
        `,[orderId])

    const items = itemsResult.rows

    return  {
        order,
        items
    }
}

export const updateOrderStatus = async (orderId,status)=>{
    const result = await pool.query(`
            UPDATE orders
            SET status = $1
            WHERE orders.id = $2
        `,[status,orderId])

    return result.rowCount
}