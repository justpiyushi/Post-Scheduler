import mongoose from "mongoose";

const generationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    mediaUrl: {
      type: String,
    },
    mediaType: {
      type: String,
      enum: ["video", "image"],
    },
    tone: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Generation = mongoose.model("Generation", generationSchema);

export default Generation;
