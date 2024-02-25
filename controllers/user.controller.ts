import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import zod from "zod";
import UserModel, { IUser } from "../models/user.model";
import AccountModel from "../models/account.model";

const signupBody = zod.object({
  username: zod.string().email(),
  firstName: zod.string(),
  lastName: zod.string(),
  password: zod.string(),
});

const signinBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});

const updateBody = zod.object({
  password: zod.string().optional(),
  firstName: zod.string().optional(),
  lastName: zod.string().optional(),
});

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

const signupController = async (req: Request, res: Response) => {
  try {
    const { success } = signupBody.safeParse(req.body);
    if (!success) {
      return res.status(411).json({
        message: "Email already taken / Incorrect inputs",
      });
    }

    const existingUser = await UserModel.findOne({
      username: req.body.username,
    });

    if (existingUser) {
      return res.status(411).json({
        message: "Email already taken/Incorrect inputs",
      });
    }

    const user = await UserModel.create({
      username: req.body.username,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    });
    const userId = user._id;
    await AccountModel.create({
      userId,
      balance: 1 + Math.random() * 10000,
    });

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET || ""
    );

    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res
      .status(200)
      .cookie("token", token, options)
      .json({ success: true, user, token });
  } catch (error) {
    console.log("Error creating user:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const { success } = signinBody.safeParse(req.body);
    console.log(success);
    if (!success) {
      return res.status(411).json({
        message: "Email already taken / Incorrect inputs",
      });
    }

    const { username, password } = req.body;
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    const isMatch = await user.isPasswordCorrect(password);

    if (!isMatch) {
      return res
        .status(404)
        .json({ success: false, message: "Incorrect password" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET || ""
    );

    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res
      .status(200)
      .cookie("token", token, options)
      .json({ success: true, user, token });
  } catch (error) {
    res.status(404).json({ success: false, message: error });
  }
};

const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log(req.user?._id);
    const { success } = updateBody.safeParse(req.body);
    if (!success) {
      return res.status(411).json({
        message: "Incorrect inputs",
      });
    }
    console.log(req.user?._id, req.body);
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: req.user?._id },
      req.body,
      { new: true }
    );
    return res.json({ user: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getUsers = async (req: Request, res: Response) => {
  const filter = req.query.filter || "";

  const users = await UserModel.find({
    $or: [
      {
        firstName: {
          $regex: filter,
          $options: "i",
        },
      },
      {
        lastName: {
          $regex: filter,
          $options: "i",
        },
      },
    ],
  });
  res.json({ users: users });
};

const logout = (req: Request, res: Response) => {
  try {
    res.cookie("token", "", { maxAge: 1 });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
    console.log("Error in signupUser: ", err.message);
  }
};
export { signupController, loginUser, updateUser, getUsers, logout };
