const mongoose = require("mongoose");

const {Schema, model} = require('mongoose')

const todoSchema = new Schema({
	todo: {
		type: String,
		required: true
	},
	userId: {
		type: String,
		required: true
	}
}, {timestamps: true})

module.exports = model('Todo', todoSchema)
