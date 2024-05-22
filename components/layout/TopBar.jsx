"use client";

import { useEffect, useState } from "react";
import { Add, Person, Search } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import {  UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { dark } from "@clerk/themes";
import Loader from "@components/Loader";

const TopBar = () => {
  const { user, isLoaded } = useUser();

  const [loading, setLoading] = useState(true);

  const [userData, setUserData] = useState({});

  const getUser = async () => {
    const response = await fetch(`/api/user/${user.id}`);
    const data = await response.json();
    setUserData(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      getUser();
    }
  }, [user]);

  const router = useRouter();
  const [search, setSearch] = useState("");

  return !isLoaded || loading ? (
    <Loader />
  ) : (
    <div className="flex justify-between items-center mt-6">
      <div className="relative">
        <input
          type="text"
          className="search-bar"
          placeholder="Search posts, people, ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          writingsuggestions="true"
        />
        <Search
          className="search-icon"
          onClick={() => router.push(`/search/posts/${search}`)}
        />
      </div>

      <button
        className="create-post-btn"
        onClick={() => router.push("/create-post")}
      >
        <Add /> <p>Create A Post</p>
      </button>

      <div className="flex gap-4 md:hidden">
        {userData &&
        <Link href={`/profile/${userData._id}/posts`}>
          <Person sx={{ fontSize: "35px", color: "white" }} />
        </Link>
        }

        <UserButton appearance={{ baseTheme: dark }} afterSignOutUrl="/sign-in" />
      </div>
    </div>
  );
};

export default TopBar;
