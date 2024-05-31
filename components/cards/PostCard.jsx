import {
    Bookmark,
    BookmarkBorder,
    BorderColor,
    Delete,
    Favorite,
    FavoriteBorder,
} from "@mui/icons-material";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import useSWR, { mutate } from 'swr';

const fetcher = url => fetch(url).then(res => res.json());

const PostCard = ({ post, creator, loggedInUser, update }) => {
    const { data: userData, error, mutate: mutateUser } = useSWR(
        loggedInUser ? `/api/user/${loggedInUser.id}` : null,
        fetcher
    );

    const [likes, setLikes] = useState(post.likes.length);
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        if (userData) {
            setIsLiked(userData.likedPosts?.some((item) => item._id === post._id));
        }
    }, [userData, post._id]);

    if (error) return <div>Failed to load user data</div>;
    if (!userData) return <div>Loading...</div>;

    const handleLike = async () => {
        try {
            const response = await fetch(`/api/user/${loggedInUser.id}/like/${post._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const updatedPost = await response.json();
                setIsLiked(!isLiked);
                setLikes(updatedPost.likes.length);
                mutate(); // Revalidate user data
                update(); // Revalidate posts data
                mutate('/api/post'); // Revalidate the posts in the home page
                mutate(`/api/user/${loggedInUser.id}`); // Revalidate the user data
            } else {
                console.error("Error liking post:", response.statusText);
            }
        } catch (error) {
            console.error("Error liking post:", error);
        }
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`/api/user/${loggedInUser.id}/save/${post._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();
            await mutateUser(); // Revalidate user data
            update(); // Revalidate posts data
        } catch (error) {
            console.error("Error saving post:", error);
        }
    };

    const handleDelete = async () => {
        try {
            await fetch(`/api/post/${post._id}`, { // Ensure the endpoint is correct
                method: "DELETE",
            });
            update(); // Revalidate posts data
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    const isSaved = userData.savedPosts?.some((item) => item._id === post._id);

    return (
        <div className="w-full max-w-xl rounded-lg flex flex-col gap-4 bg-dark-1 p-5 max-sm:gap-2">
            <div className="flex justify-between">
                <Link href={`/profile/${creator._id}/posts`}>
                    <div className="flex gap-3 items-center">
                        <Image
                            src={creator.profilePhoto}
                            alt="profile photo"
                            width={50}
                            height={50}
                            className="rounded-full"
                        />
                        <div className="flex flex-col gap-1">
                            <p className="text-small-semibold text-light-1">
                                {creator.firstName} {creator.lastName}
                            </p>
                            <p className="text-subtle-medium text-light-3">@{creator.username}</p>
                        </div>
                    </div>
                </Link>

                {loggedInUser.id === creator.clerkId && (
                    <Link href={`/edit-post/${post._id}`}>
                        <BorderColor sx={{ color: "white", cursor: "pointer" }} />
                    </Link>
                )}
            </div>

            <p className="text-body-normal text-light-1 max-sm:text-small-normal">{post.caption}</p>

            <Image
                src={post.postPhoto}
                alt="post photo"
                width={200}
                height={150}
                className="rounded-lg w-full"
            />

            <p className="text-base-semibold text-purple-1 max-sm:text-small-normal">{post.tag}</p>

            <div className="flex justify-between">
                <div className="flex gap-2 items-center">
                    {isLiked ? (
                        <Favorite sx={{ color: "red", cursor: "pointer" }} onClick={handleLike} />
                    ) : (
                        <FavoriteBorder sx={{ color: "white", cursor: "pointer" }} onClick={handleLike} />
                    )}
                    <p className="text-light-1">{likes}</p>
                </div>

                {loggedInUser.id !== creator.clerkId &&
                    (isSaved ? (
                        <Bookmark sx={{ color: "purple", cursor: "pointer" }} onClick={handleSave} />
                    ) : (
                        <BookmarkBorder sx={{ color: "white", cursor: "pointer" }} onClick={handleSave} />
                    ))}

                {loggedInUser.id === creator.clerkId && (
                    <Delete sx={{ color: "white", cursor: "pointer" }} onClick={handleDelete} />
                )}
            </div>
        </div>
    );
};

export default PostCard;
