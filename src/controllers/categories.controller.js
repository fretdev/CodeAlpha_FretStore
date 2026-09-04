import { getAllCategories } from "../services/categories.service.js";

export const getCategories = async (req,res)=>{
    try{
        const categories = await getAllCategories()

        res.status(200).json(categories)
    } catch(error){
        console.error("Failed to fetch categories:",error.message)
        res.status(500).json({
            message: "Failed to fetch categories"
        })
    }
}