import User from "@lib/models/User";
import { connectToDatabase } from "@lib/mongodb/mongoose";

export const GET = async (req, { params }) => {
  const { query } = params;

  try {
    await connectToDatabase();

    const searchedUsers = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
      ],
    }).populate("posts savedPosts likedPosts followers following").exec();

    return new Response(JSON.stringify(searchedUsers), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to get users by search", { status: 500 })
  }
}