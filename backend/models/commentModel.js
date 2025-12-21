/** @format */

import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: { type: String },
    image: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },

    isHidden: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);
