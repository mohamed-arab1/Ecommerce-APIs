const Product = require('../models/product.model');
const asyncWrapper = require('../middlewares/asyncWrapper');
const slugify = require('slugify');

//create a new product
const createProduct = asyncWrapper(async (req, res) => {
    try{
        if(req.body.title){
            req.body.slug = slugify(req.body.title);
        }
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.json({
            message: "product created",
            data: newProduct
        });
    }catch(err){
        throw new Error(err);
    }
});

//gat a product
const getProduct = asyncWrapper(async (req, res) => {
    const {id} = req.params;
    try{
        const product = await Product.findById(id, {'__v': false})
        res.json({
            message: "get a product is successfully",
            data: product
        });
    }catch(err){
        throw new Error(err);
    }
});

//get all products
const getAllProducts = asyncWrapper(async (req, res) => {
    try{
        const allProducts = await Product.find({}, {'__v': false});
        res.json({
            message: 'get all products successfully',
            data: allProducts
        });
    }catch(err){
        throw new Error(err);
    }
});

//update product
const updateProduct = asyncWrapper(async (req, res) => {
    const {id} = req.params;
    try{
        if(req.body.title){
            req.body.slug = slugify(req.body.title);
        }
        const updateProduct = await Product.findOneAndUpdate({
            _id: id,
            },
            req.body, 
            {
                new: true
            }
        )
        res.json({
            message: 'updated product successfully',
            data: updateProduct
        })
    }catch(err){
        throw new Error(err);
    }
})

//remove product
const deleteProduct = asyncWrapper(async (req, res) => {
    const {id} = req.params;
    try{
        const deleteProduct = await Product.findByIdAndDelete(id);
        res.json({
            message: 'delete product successfully',
            data: deleteProduct
        })
    }catch(err){
        throw new Error(err);
    }
})

module.exports = {
    createProduct,
    getProduct,
    getAllProducts,
    updateProduct,
    deleteProduct
};