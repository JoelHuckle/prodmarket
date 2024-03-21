"use server";
import connectDB from "../../config/database";
import Post from "../../models/Post";

const postActions = async () => {
  connectDB();
  try {
    await Post.create({
      comment: req.body.comment,
      likes: 0,
      post: req.params.id,
    });
  } catch (error) {}
};

export default postActions;
