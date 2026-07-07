import { AuthRequest } from "../middlewares/auth.middleware.js";
import { Response } from "express";
import Account from "../models/account.model.js";
import zernio from "../config/zernio.js";

// GET all accounts
// GET /api/v1/accounts
export const getAccounts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const accounts = await Account.find({ user: req.user._id });
    res.json(accounts);
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || "Server error",
    });
  }
};

// Add Account
// POST /api/v1/accounts
export const addAccount = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { platform, handle, avatarUrl } = req.body;

    const account = await Account.create({
      user: req.user._id,
      platform,
      handle,
      avatarUrl,
    });
    res.status(201).json(account);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

// Disconnect Account
// DELETE /api/v1/accounts/:id
export const disconnectAccount = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { platform, handle, avatarUrl } = req.body;

    const account = await Account.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!account) {
      res.status(404).json({
        message: "Account not found",
      });
      return;
    }

    if (account.zernioAccountId) {
      try {
        await zernio.accounts.deleteAccount({
          path: { accountId: account.zernioAccountId },
        });
      } catch (error: any) {
        console.log(error);
        res.status(500).json({
          message: error.message || "Server error",
        });
        return;
      }
    }

    await account.deleteOne();
    res.json({});
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};
