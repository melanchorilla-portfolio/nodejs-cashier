import mongoose from 'mongoose';
import Product from '../models/Product.js'
import Category from '../models/Category.js'

const index = async (req, res) => {
    try {
        const products = await Product.find({status: 'active'});

        if (!products) { throw { code: 500, message: "Get products failed" } }

        return res.status(200).json({
            status: true,
            total: products.length,
            products
        })
    } catch (err) {
        return res.status(err.code).json({
            status: false,
            message: err.message
        })
    }
}

const store = async (req, res) => {
    try {
        const title = req.body.title;
        const thumbnail = req.body.thumbnail;
        const price = req.body.price;
        const categoryId = req.body.categoryId;

        // is required
        if (!title) { throw { code: 428, message: "Title required" } }
        if (!thumbnail) { throw { code: 428, message: "Thumbnail required" } }
        if (!price) { throw { code: 428, message: "Price required" } }
        if (!categoryId) { throw { code: 428, message: "Category Id required" } }

        // is product exist
        const productExist = await Product.findOne({ title: title })
        if (productExist) { throw { code: 428, message: "Product is exist" } }

        // is objectId
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            throw { code: 500, message: "Category Id is invalid" }
        }

        // is category exist
        const categoryExist = await Category.findOne({ _id: categoryId })
        if (!categoryExist) { throw { code: 428, message: "Category does not exist" } }

        const newProduct = new Product({
            title,
            thumbnail,
            price,
            categoryId
        })
        const product = await newProduct.save();

        if (!product) { throw { code: 500, message: "Store product failed" } }

        return res.status(200).json({
            status: true,
            product
        })
    } catch (err) {
        if(!err.code) {err.code = 500}
        return res.status(err.code).json({
            status: false,
            message: err.message
        })
    }
}

export { index, store }