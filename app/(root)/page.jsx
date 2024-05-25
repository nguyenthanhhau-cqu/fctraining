"use client";

import { useUser } from "@clerk/nextjs";
import Loader from "@components/Loader";
import PostCard from "@components/cards/PostCard";
import useSWR from 'swr';

const fetcher = url => fetch(url).then(res => res.json());

const Home = () => {
  const { user, isLoaded } = useUser();
  const { data, error, mutate } = useSWR('/api/post', fetcher);

  if (!data || !isLoaded) return <Loader />;

  return (
      <div className="flex flex-col gap-10">
        {data.map((post) => (
            <PostCard
                key={post._id}
                post={post}
                creator={post.creator}
                loggedInUser={user}
                update={mutate} // Pass the mutate function
            />
        ))}
      </div>
  );
};

export default Home;
