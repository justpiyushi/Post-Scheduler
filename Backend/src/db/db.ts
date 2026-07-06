import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Connected to DB");
    });

    await mongoose.connect(
      `${process.env.MONGODB_URI!}/${process.env.DB_NAME!}`,
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }


    process.exit(1);
  }
};

export default connectDB;
