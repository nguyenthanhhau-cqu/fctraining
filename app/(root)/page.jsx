"use client";

import { useUser } from "@clerk/nextjs";
import Loader from "@components/Loader";
import PostCard from "@components/cards/PostCard";
import { useEffect, useState } from "react";

const Home = () => {
  const { user, isLoaded } = useUser();

  const [loading, setLoading] = useState(true);
  const [feedPost, setFeedPost] = useState([]);

  const getFeedPost = async () => {
    const response = await fetch("/api/post", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },});
    const data = await response.json();
    setFeedPost(data);
    setLoading(false);
  };

  useEffect(() => {
    getFeedPost();
  }, []); // Initial fetch only

  return loading || !isLoaded ? (
      <Loader />
  ) : (
      <div className="flex flex-col gap-10">
        {feedPost.map((post) => (
            <PostCard
                key={post._id}
                post={post}
                creator={post.creator}
                loggedInUser={user}
                update={getFeedPost} // Pass the update function
            />
        ))}
      </div>
  );
};

export default Home;
