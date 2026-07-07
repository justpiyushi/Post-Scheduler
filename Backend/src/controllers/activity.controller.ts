import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import ActivityLog from "../models/activity.model.js";

// Get all activity
// GET /api/v1/activity
export const getActivity = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const activity = await ActivityLog.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("relatedPost", "content");
    res.status(200).json(activity);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      message: error.message || "Internal Server error",
    });
  }
};
