import Post from "@lib/models/Post";
import { connectToDatabase } from "@lib/mongodb/mongoose";

export const GET = async (req, { params }) => {
  const { query } = params;

  try {
    await connectToDatabase();

    const searchedPosts = await Post.find({
      $or: [
        { caption: { $regex: query, $options: "i" } },
        { tag: { $regex: query, $options: "i" } },
      ],
    }).populate("creator likes").exec();

    return new Response(JSON.stringify(searchedPosts), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to get posts by search", { status: 500 })
  }
};
