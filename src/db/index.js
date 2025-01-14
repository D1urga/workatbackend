import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectInstance = await mongoose.connect(
      "mongodb+srv://anoop:anoop1234@cluster0.4c4er.mongodb.net/databases?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log(connectInstance.connection.host);
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
