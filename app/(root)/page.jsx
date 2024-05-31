'use client'

import { useUser } from "@clerk/nextjs";
import Loader from "@components/Loader";
import PostCard from "@components/cards/PostCard";
import useSWR from 'swr';
import { useRouter } from 'next/navigation';

// Fetcher function to fetch data from the API
const fetcher = url => fetch(url).then(res => res.json());

export default function Home() {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    // If the user is not loaded yet, show a loader
    if (!isLoaded) {
        return <Loader />;
    }

    // If the user is not logged in, redirect to the sign-in page
    if (!user) {
        router.push('/sign-in');
        return null; // Return null to render nothing while redirecting
    }

    const { data, error, mutate } = useSWR('/api/post', fetcher);

    if (error) return <div>Failed to load</div>;
    if (!data) return <Loader />;

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
    )
}
