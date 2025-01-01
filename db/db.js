const mongoose = require("mongoose");

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("MongoDB connected");
	} catch (error) {
		console.log(error);
		setTimeout(connectDB, 5000);
	}
}

module.exports = connectDB;