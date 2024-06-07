'use client';
import useSWR, { SWRConfig } from 'swr';
import { useUser } from '@clerk/nextjs';
import Loader from '@components/Loader';
import PostCard from '@components/cards/PostCard';
import { useEffect } from "react";
import { useRouter } from 'next/navigation';

// Fetcher function to fetch data from the API
const fetcher = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        const error = new Error('An error occurred while fetching the data.');
        error.info = await response.json(); // Add error information if available
        error.status = response.status;
        throw error;
    }
    return response.json();
};

const Home = () => {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && !user) {
            router.push('/sign-in');
        }
    }, [isLoaded, user, router]);

    // Fetch posts data using SWR, disable revalidation
    const { data, error, mutate } = useSWR(
        isLoaded && user ? '/api/post' : null,
        fetcher,
        { revalidateOnFocus: false, revalidateOnReconnect: false, shouldRetryOnError: false }
    );

    const handleLike = async (postId) => {
        try {
            const response = await fetch(`/api/user/${user.id}/like/${postId}`, { method: "POST" });

            if (response.ok) {
                // Revalidate the SWR cache for the /api/post route
                mutate('/api/post');
            } else {
                console.error('Failed to like post');
            }
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    if (!isLoaded || !user || !data) {
        return <Loader />;
    }

    if (error) {
        console.error('Error fetching posts:', error);
        return <div>Failed to load</div>;
    }

    return (
        // Wrap your component tree with SWRConfig
        <SWRConfig value={{ fetcher }}>
            <div className="flex flex-col gap-10">
                {data.map((post) => (
                    <PostCard
                        key={post._id}
                        post={post}
                        creator={post.creator}
                        loggedInUser={user}
                        update={mutate}
                        handleLike={handleLike}
                    />
                ))}
            </div>
        </SWRConfig>
    );
};

export default Home;

