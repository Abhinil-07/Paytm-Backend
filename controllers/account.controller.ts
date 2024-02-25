import { Request, Response } from "express";
import AccountModel from "../models/account.model";
import { IUser } from "../models/user.model";
import mongoose from "mongoose";

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

const getBalance = async (req: AuthenticatedRequest, res: Response) => {
  console.log(req.user?._id);
  try {
    const userId = req.user?._id;
    const account = await AccountModel.findOne({ userId });
    res.status(200).json({
      balance: account?.balance,
      name: req.user?.firstName,
    });
  } catch (error) {
    console.log(error);
  }
};

const transferMoney = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    const { amount, to } = req.body;
    if (amount <= 0) {
      return res.status(400).json({
        message: "Invalid amount",
      });
    }
    if (to === req.user?._id) {
      return res.status(400).json({
        message: "Cannot transfer to self",
      });
    }

    const account = await AccountModel.findOne({
      userId: req.user?._id,
    }).session(session);

    if (!account || account.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Insufficient balance",
      });
    }

    const toAccount = await AccountModel.findOne({ userId: to }).session(
      session
    );

    if (!toAccount) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Invalid account",
      });
    }

    await AccountModel.updateOne(
      { userId: req.user?._id },
      { $inc: { balance: -amount } }
    ).session(session);

    await AccountModel.updateOne(
      { userId: to },
      { $inc: { balance: amount } }
    ).session(session);

    await session.commitTransaction();
    res.json({
      message: "Transfer successful",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { getBalance, transferMoney };
