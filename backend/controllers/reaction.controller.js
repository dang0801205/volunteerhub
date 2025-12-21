/** @format */
import asyncHandler from "express-async-handler";
import Reaction from "../models/reactionModel.js";
import Post from "../models/postModel.js";
import Comment from "../models/commentModel.js";
import Channel from "../models/channelModel.js";
import Event from "../models/eventModel.js";

// @desc Thêm cảm xúc vào bài viết hoặc bình luận
// @access Private
export const addReaction = asyncHandler(async (req, res) => {
  const { type, post: postId, comment: commentId } = req.body;
  const userId = req.user._id.toString();

  if (!type || (!postId && !commentId)) {
    return res
      .status(400)
      .json({ message: "Reaction type and target (post or comment) required" });
  }

  if (postId && commentId) {
    return res.status(400).json({
      message: "Reaction can only be added to post OR comment, not both",
    });
  }

  let post = null;

  if (postId) {
    post = await Post.findById(postId).populate("channel");
    if (!post || post.isDeleted)
      return res.status(404).json({ message: "Post not found" });
  }

  if (commentId) {
    const comment = await Comment.findById(commentId).populate("post");
    if (!comment || comment.isDeleted)
      return res.status(404).json({ message: "Comment not found" });
    post = await Post.findById(comment.post._id).populate("channel");
    if (!post || post.isDeleted)
      return res
        .status(404)
        .json({ message: "Post not found for this comment" });
  }

  const channel = await Channel.findById(post.channel._id).populate("event");
  const event = channel.event;
  const isAdmin = req.user.role === "admin";
  const isEventMember =
    event.managers.map((id) => id.toString()).includes(userId) ||
    event.volunteers.map((id) => id.toString()).includes(userId);

  if (!isAdmin && !isEventMember) {
    return res
      .status(403)
      .json({ message: "You are not allowed to react to this post/comment" });
  }

  const query = { user: userId };
  if (postId) query.post = postId;
  if (commentId) query.comment = commentId;

  let reaction = await Reaction.findOne(query);

  if (reaction) {
    reaction.type = type;
    await reaction.save();
    return res.json(reaction);
  }

  const newReactionData = { type, user: userId };
  if (postId) newReactionData.post = postId;
  if (commentId) newReactionData.comment = commentId;

  reaction = await Reaction.create(newReactionData);
  const targetOwnerId = postId
    ? post.author.toString()
    : comment.author.toString();

  if (targetOwnerId !== userId) {
    emitNotification(req, targetOwnerId, {
      title: "Tương tác mới",
      message: `${req.user.userName} đã thả cảm xúc vào ${
        postId ? "bài viết" : "bình luận"
      } của bạn.`,
      type: "info",
      link: `/media?eventId=${event._id}&postId=${post._id}`,
    });
  }

  res.status(201).json(reaction);
});

// @desc Gỡ bỏ cảm xúc đã bày tỏ
// @access Private
export const removeReaction = asyncHandler(async (req, res) => {
  const reaction = await Reaction.findById(req.params.id);

  if (!reaction) return res.status(404).json({ message: "Reaction not found" });
  if (reaction.user.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "You can only remove your own reaction" });
  }

  await reaction.deleteOne();
  res.json({ message: "Reaction removed successfully" });
});

// @desc Lấy danh sách các cảm xúc của một bài viết hoặc bình luận
// @access Private (Yêu cầu quyền truy cập nội dung)
export const getReactions = asyncHandler(async (req, res) => {
  const { post: postId, comment: commentId } = req.query;

  if (!postId && !commentId) {
    return res
      .status(400)
      .json({ message: "post or comment query param required" });
  }

  let post = null;

  if (postId) {
    post = await Post.findById(postId).populate("channel");
    if (!post || post.isDeleted)
      return res.status(404).json({ message: "Post not found" });
  }

  if (commentId) {
    const comment = await Comment.findById(commentId).populate("post");
    if (!comment || comment.isDeleted)
      return res.status(404).json({ message: "Comment not found" });
    post = await Post.findById(comment.post._id).populate("channel");
    if (!post || post.isDeleted)
      return res
        .status(404)
        .json({ message: "Post not found for this comment" });
  }

  const channel = await Channel.findById(post.channel._id).populate("event");
  const event = channel.event;
  const userId = req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  const isEventMember =
    event.managers.map((id) => id.toString()).includes(userId) ||
    event.volunteers.map((id) => id.toString()).includes(userId);

  if (!isAdmin && !isEventMember) {
    return res.status(403).json({
      message: "You are not allowed to view reactions for this post/comment",
    });
  }

  const filter = {};
  if (postId) filter.post = postId;
  if (commentId) filter.comment = commentId;

  console.log("Reaction filter:", filter);

  const reactions = await Reaction.find(filter).populate(
    "user",
    "userName role"
  );

  const summary = reactions.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});

  res.json({ reactions, summary });
});
