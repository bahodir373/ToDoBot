const mongoose = require("mongoose");

const {Schema, model} = require('mongoose')

const userSchema = new Schema({
	userId: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: false
	},
	first_name: {
		type: String,
		required: true
	}
}, {timestamps: true})

module.exports = model('User', userSchema)
