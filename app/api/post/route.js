import Post from "@lib/models/Post";
import { connectToDatabase } from "@lib/mongodb/mongoose";

export const GET = async (req,res) => {
  try {
    await connectToDatabase();

    const feedPosts = await Post.find().populate("creator likes").exec();

    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120');


    return new Response(JSON.stringify(feedPosts), { status: 200 });


  } catch (err) {
    console.error("Error fetching feed posts:", err);
    return new Response("Failed to fetch all Feed Posts", { status: 500 });
  }
};
