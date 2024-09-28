// import modules 
import mongoose from "mongoose";
export const connectDB = () => {
    return mongoose.connect(process.env.DB_URL).then(() => {
    console.log('db connecton successfully');
}).catch((err) => {
    console.log('faild to connect to db ');
    
})}
