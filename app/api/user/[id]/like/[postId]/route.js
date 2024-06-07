import Post from "@lib/models/Post"
import User from "@lib/models/User"
import { connectToDatabase } from "@lib/mongodb/mongoose"

export const POST = async (req, { params }) => {
    try {
        await connectToDatabase()

        const userId = params.id
        const postId = params.postId

        const user = await User.findOne({ clerkId: userId }).populate("posts savedPosts following followers").populate({
            path: "likedPosts",
            model: "Post",
            populate: {
                path: "creator",
                model: "User",
            },
        })

        const post = await Post.findById(postId).populate("creator likes")

        const isLiked = user.likedPosts.find((item) => item._id.toString() === postId)

        if (isLiked) {
            user.likedPosts = user.likedPosts.filter((item) => item._id.toString() !== postId)
            post.likes = post.likes.filter((item) => item._id.toString() !== user._id.toString())
        } else {
            user.likedPosts.push(post._id)
            post.likes.push(user._id)
        }

        await user.save();
        await post.save();

        // Return the updated post object
        return new Response(JSON.stringify(post.toObject()), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (err) {
        console.log(err);
        return new Response('Failed to like/dislike post', { status: 500 });
    }


}