import { getAllProducts,getProductById,createProduct,editProduct, deleteProduct} from "../services/products.service.js";

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

export const createProductController = async (req,res)=>{
    try{
        const {categoryId,name,brand,description,price,stockQuantity,imageUrl} = req.body
        
        const product = await createProduct(categoryId,name,brand,description,price,stockQuantity,imageUrl)

        res.status(201).json({
            message: "Product created successfully",
            productId: product
        })
    } catch(error){
        console.error("Failed to create product:",error.message)
        res.status(500).json({
            message:"Failed to create product"
        })
    }
}

export const updateProductController = async (req,res) =>{
    try{
        const productId = req.params.id
        const updates = req.body

        const result = await editProduct(productId,updates)
        if(!result){
            return res.status(404).json({
                message: "Product not found"
            })
        }

        res.status(200).json({
            message: "Product updated successfully"
        })
    } catch(error){
        console.error("Failed to update product:",error.message)
        res.status(500).json({
            message: "Failed to update product"
        })
    }
}

export const deleteProductController = async (req,res)=>{
    try{
        const productId = req.params.id

        const result = await deleteProduct(productId)

        if(result === 0){
            return res.status(404).json({
                message: "Product not found"
            })
        }
        res.status(200).json({
            message: "Product deleted successfully"
        })
    } catch(error){
        console.error("Failed to delete product",error.message)
        res.status(500).json({
            message: "Failed to delete product"
        })
    }
}