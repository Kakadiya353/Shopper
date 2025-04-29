const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("MongoDB connected successfully");

    }catch(e) {
        console.error("Error connecting to MongoDB:", e.message);
        process.exit(1);  // Exit the application with an error status code
    }
};

module.exports = connectDB;