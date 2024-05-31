"use client";

import Loader from '@components/Loader';
import UserCard from '@components/cards/UserCard';
import useSWR from 'swr';
import React from 'react';

const fetcher = url => fetch(url).then(res => res.json());

const People = () => {
    const { data, error, mutate } = useSWR('/api/user', fetcher);

    if (error) {
        console.error("Failed to load users:", error);
        return <div>Failed to load users</div>;
    }

    if (!data) {
        return <Loader />;
    }

    return (
        <div className='flex flex-col gap-4 py-6'>
            {data.map((user) => (
                <UserCard key={user.id} userData={user} update={mutate} />
            ))}
        </div>
    );
};

export default People;
