const mongoose = require("mongoose");

const MONGODB_URL = "mongodb://127.0.0.1:27017/expense_tracker";

async function connectDatabase() {
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB.");
}

module.exports = connectDatabase;
