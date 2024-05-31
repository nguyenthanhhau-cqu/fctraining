'use client';

import { useUser } from "@clerk/nextjs";
import Loader from "@components/Loader";
import PostCard from "@components/cards/PostCard";
import useSWR from 'swr';
import { useEffect } from "react";
import { useRouter } from 'next/navigation';

// Fetcher function to fetch data from the API
const fetcher = url => fetch(url).then(res => res.json());

const Home = () => {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    // Redirect to sign-in page if the user is not logged in
    useEffect(() => {
        if (isLoaded && !user) {
            router.push('/sign-in');
        }
    }, [isLoaded, user, router]);

    // Fetch posts data using SWR
    const { data, error, mutate } = useSWR(isLoaded && user ? '/api/post' : null, fetcher, {
        shouldRetryOnError: false,
        refreshInterval: 1000, // Revalidate cache every second
    });

    // Render loader while user data or posts data is loading
    if (!isLoaded || !user || !data) {
        return <Loader />;
    }

    if (error) {
        return <div>Failed to load</div>;
    }

    return (
        <div className="flex flex-col gap-10">
            {data.map((post) => (
                <PostCard
                    key={post._id}
                    post={post}
                    creator={post.creator}
                    loggedInUser={user}
                    update={mutate} // Pass the mutate function to revalidate data
                />
            ))}
        </div>
    );
};

export default Home;
