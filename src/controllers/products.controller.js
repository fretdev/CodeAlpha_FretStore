import { getAllProducts } from "../services/products.service.js";

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