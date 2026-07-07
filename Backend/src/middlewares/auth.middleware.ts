import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { JwtPayload } from "jsonwebtoken";

interface TokenPayload extends JwtPayload {
  _id: string;
}

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token =
    req.cookies.token || req.headers?.authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({
      message: "No token provided",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    req.user = await User.findById(decoded._id).select("-password");
    next();
  } catch (error: any) {
    console.log(error);
    res.status(401).json({
      message: error?.message || "Not authorized, token failed",
    });
  }
};
