import mongoose from "mongoose";

export const database_connection = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/saraha_app_1')
    console.log('Database connected');
  } catch (error) {
    console.log('Database not connected' ,  error);
  }
}