const Post = require("../models/post");

exports.createPost = async (req, res) => {
  const data = await req.body;
  await Post.create({
    user: data.user,
    title: data.title,
    caption: data.caption,
    likes: 0,
    url: data.link,
    preview: data.preview,
  });
  res.json("post created");
};
