import mongoose from "mongoose";


const connectDB = (uri) => {
    mongoose
        .connect(uri, { dbName: "Mern_Chat_App" })
        .then((data) => console.log(`Connected to DB: ${data.connection.host}`))
        .catch((err) => {
            console.log(err.message)
        })
}

export default connectDB;