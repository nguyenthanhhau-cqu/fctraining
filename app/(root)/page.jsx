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
    try {
      const response = await fetch("/api/post", {
        method: "GET",
      });
      const data = await response.json();
      setFeedPost(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getFeedPost();
    }
  }, [user]);

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
