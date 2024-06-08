'use client';

import { useUser } from "@clerk/nextjs";
import Loader from "@components/Loader";
import PostCard from "@components/cards/PostCard";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

const Home = () => {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [feedPosts, setFeedPosts] = useState([]);

    useEffect(() => {
        if (isLoaded && !user) {
            router.push('/sign-in');
        } else if (isLoaded && user) {
            const fetchPosts = async () => {
                try {
                    const response = await fetch('/api/post', { next: { revalidate: 1 } });
                    const data = await response.json();
                    setFeedPosts(data);
                } catch (error) {
                    console.error("Error fetching posts:", error);
                }
            };

            fetchPosts();
        }
    }, [isLoaded, user, router]);

    // Function to refetch posts
    const refetchPosts = async () => {
        const response = await fetch('/api/post', { next: { revalidate: 1 } });
        const data = await response.json();
        setFeedPosts(data);
    };

    if (!isLoaded || !user || !feedPosts) {
        return <Loader />;
    }

    return (
        <div className="flex flex-col gap-10">
            {feedPosts.map((post) => (
                <PostCard
                    key={post._id}
                    post={post}
                    creator={post.creator}
                    loggedInUser={user}
                    update={refetchPosts} // Pass the refetchPosts function to PostCard
                />
            ))}
        </div>
    );
};

export default Home;

