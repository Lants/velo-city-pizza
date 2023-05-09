// All functional behavior for category model. Called from order.js.
// Most (if not all) functions are async. Ask me if you don't know what that is in this context

const Category = require('../models/categoryModel')
const SquareTools = require('../square_tools/catalog')
const mongoose = require('mongoose')

// GET all categories
const getCategories = async (req, res) => {
    const categories = await Category.find({}).sort({createdAt: -1})
    // ^ Sorted by date created. Change sort function if desired

    res.status(200).json(categories)
}

// GET a single category
const getCategoryById = async (req, res) => {
    const {id} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such category'})
    }

    const category = await Category.findById(id)
    
    if (!category) {
        return res.status(404).json({error: 'Given category does not exist'})
    }
    res.status(200).json(category)
}

// POST a new category
/**
 * @sideEffect Deletes old category entries with a matching "name" attribute
 */
const createCategory = async (req, res) => {
    // See ../models/categoryModel.js
    const { name, description, selectionId } = req.body
    debug.log(req.body)
    const { status, jsonMsg } = await postCategory(name, description, selectionId)
    debug.log(status, jsonMsg)
    return res.status(status).json(jsonMsg)
}

// DELETE a category
const deleteCategory = async (req, res) => {
    const {id} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such category'})
    }

    const category = await Category.findOneAndDelete({_id: id})

    if (!category) {
        return res.status(400).json({error: 'Given category does not exist'})
    }

    res.status(200).json(category)
}

// UPDATE a category
const updateCategory = async (req, res) => {
    const {id} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such category'})
    }

    const category = await Category.findOneAndUpdate({_id: id}, {
        ...req.body
    })

    if (!category) {
        return res.status(400).json({error: 'No such category'})
    }

    res.status(200).json(category)
}

// UPDATE all categories (deletes old ones)
const updateAllCategories = async (req, res) => {
    var customAttributes = await SquareTools.retrieveCustomAttrs()
    // categoryNameIdPairs = await SquareTools.retrieveCategories()

    debug.log(customAttributes)
    if (customAttributes == null) {
        return res.status(400).json({error: 'Square retrieval failed'})
    }
    var { customAttrId, customAttrPairs } = customAttributes

    var ret = {}
    for (const category of customAttrPairs.reverse()) {
        let postResult = await postCategory(category.name, 'test description', category.selectionId)
        if (postResult.status !== 200) {
            return res.status(postResult.status).json(postResult.jsonMsg)
        }
        Object.assign(ret, postResult)
    }
    return res.status(200).json(customAttrPairs)
}

// ------------------- Helpers -------------------------

// POST category
/**
 * @returns {Object} status: 200 or 400, jsonMsg: created category or error
 * @sideEffect Deletes old category entries with a matching "name" attribute
 */
async function postCategory(name, description, selectionId) {
    try {
        const deleteResult = await Category.deleteMany({ name })
        console.log("Deleted documents =>", deleteResult)
        category = await Category.create({ name, description, selectionId })
        return {status: 200, jsonMsg: { category, deleteResult }}
    }
    catch (error) {
        return {status: 400, jsonMsg: {
            error: `categoryController.postCategory error: ${error.message}`
        }}
    }
}


module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    deleteCategory,
    updateCategory,
    updateAllCategories
}