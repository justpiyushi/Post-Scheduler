import { Request, Response } from "express";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Register User
// POST /api/v1/auth/register

export const registerUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({
        message: "User already exists",
      });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const token = jwt.sign(
      {
        _id: user._id,
      },
      process.env.JWT_SECRET || "fallback_secret",
      {
        expiresIn: "30d",
      },
    );

    res.cookie("token", token);

    if (User) {
      res.status(201).json({
        message: "User registered successfully",
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
        },
        token,
      });
    } else {
      res.status(400).json({
        message: "Invalid user data",
      });
    }
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

// Login User
// POST /api/v1/auth/login

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({
        message: "Invalid email",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(400).json({
        message: "Invalid password",
      });
      return;
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      process.env.JWT_SECRET || "fallback_secret",
      {
        expiresIn: "30d",
      },
    );

    res.cookie("token", token);

    res.status(200).json({
      message: "User Login Successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        token,
      },
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};
