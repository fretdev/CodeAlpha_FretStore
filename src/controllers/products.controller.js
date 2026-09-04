import { getAllProducts,getProductById } from "../services/products.service.js";

export const getProducts = async (req, res) => {
    try {
        const products = await getAllProducts();

        res.status(200).json(products);
    } catch (error) {
        console.error("Failed to fetch products:", error.message);

        res.status(500).json({
            message: "Failed to fetch products",
        });
    }
};

export const getProduct = async (req,res)=>{
    try{
        const id = Number(req.params.id)
        if(!Number.isInteger(id) || id <= 0){
            return res.status(400).json({
                message: "Product ID must be a positive integer"
            })
        }
        const product = await getProductById(id)
        if(!product){
            return res.status(404).json({
                message:"Product not found"
            })
        }

        res.status(200).json(product)
    }
    catch (error){
        console.error("Failed to fetch product:",error.message);

        res.status(500).json({
            message: "Failed to fetch product"
        })
    }
}