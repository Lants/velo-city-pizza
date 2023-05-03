// Model for categories in /order page. Defines template for categories.

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const categorySchema = new Schema({
    _id: String, // Overwrite ID with category ID (selectionID)
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    itemList: [{
        type: Schema.Types.ObjectId,
        ref: 'Item'
    }]
}, {timestamps: true})

module.exports = mongoose.model('Category', categorySchema)
