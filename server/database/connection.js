const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // mongoDB connection string
        const con = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }) 

        console.log(`MongoDB connected: ${con.connection.host}`)
    } catch (error) {
        console.log(error);
        process.exit(1)
    }
}

// export connectDB
module.exports = connectDB