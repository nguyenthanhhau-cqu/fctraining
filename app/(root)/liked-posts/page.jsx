'use client';

import { useUser } from '@clerk/nextjs';
import Loader from '@components/Loader';
import PostCard from '@components/cards/PostCard';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import {useEffect} from "react";

const fetcher = url => fetch(url).then(res => res.json());

const LikedPosts = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Redirect to sign-in page if the user is not logged in
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  // Fetch user data using SWR
  const { data, error, mutate } = useSWR(
      isLoaded && user ? `/api/user/${user.id}` : null,
      fetcher,
      { shouldRetryOnError: false }
  );

  // Render loader while user data is loading
  if (!isLoaded || !user || !data) {
    return <Loader />;
  }

  if (error) {
    console.error("Failed to load user data:", error);
    return <div>Failed to load liked posts</div>;
  }

  return (
      <div className='flex flex-col gap-9'>
        {data.likedPosts?.map((post) => (
            <PostCard key={post._id} post={post} creator={post.creator} loggedInUser={user} update={mutate} />
        ))}
      </div>
  );
}

export default LikedPosts;
