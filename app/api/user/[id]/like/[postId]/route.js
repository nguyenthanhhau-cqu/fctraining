import Post from "@lib/models/Post";
import User from "@lib/models/User";
import { connectToDatabase } from "@lib/mongodb/mongoose";

export const POST = async (req, { params }) => {
  try {
    await connectToDatabase();

    const userId = params.id;
    const postId = params.postId;

    const user = await User.findOne({ clerkId: userId }).populate("posts savedPosts following followers").populate({
      path: "likedPosts",
      model: "Post",
      populate: {
        path: "creator",
        model: "User",
      },
    })
    const post = await Post.findById(postId).populate("creator likes")

    if (!user || !post) {
      return new Response("User or Post not found", { status: 404 });
    }

    const isLiked = user.likedPosts.some((item) => item._id.toString() === postId);

    if (isLiked) {
      user.likedPosts = user.likedPosts.filter((item) => item._id.toString() !== postId);
      post.likes = post.likes.filter((item) => item._id.toString() !== user._id.toString());
    } else {
      user.likedPosts.push(post._id);
      post.likes.push(user._id);
    }

    await user.save();
    await post.save();

    return new Response(JSON.stringify(post), { status: 200 });
  } catch (err) {
    console.error("Error liking/disliking post:", err);
    return new Response("Failed to like/dislike post", { status: 500 });
  }
};
