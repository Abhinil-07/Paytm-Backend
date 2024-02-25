import mongoose from "mongoose";
import { Document } from "mongoose";
import UserModel from "./user.model";

interface IAccount extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  balance: number;
}

const accountSchema = new mongoose.Schema<IAccount>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: UserModel,
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    required: true,
  },
});

const AccountModel = mongoose.model<IAccount>("Account", accountSchema);

export default AccountModel;
