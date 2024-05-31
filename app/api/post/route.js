import Post from "@lib/models/Post";
import { connectToDatabase } from "@lib/mongodb/mongoose";

export async function GET() {
  try {
    await connectToDatabase();

    const feedPosts = await Post.find().populate("creator likes").exec();

    return new Response(JSON.stringify(feedPosts), {status: 200});


  } catch (err) {
    console.error("Error fetching feed posts:", err);
    return new Response("Failed to fetch all Feed Posts", {status: 500});
  }
}
