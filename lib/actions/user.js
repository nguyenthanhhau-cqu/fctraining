import User from "@lib/models/User";
import { connectToDatabase } from "@lib/mongodb/mongoose";

export const createOrUpdateUser = async (
  id,
  first_name,
  last_name,
  image_url,
  email_addresses,
  username
) => {
  try {
    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      { clerkId: id },
      {
        $set: {
          firstName: first_name,
          lastName: last_name,
          profilePhoto: image_url,
          email: email_addresses[0].email_address,
          username: username
        },
      },
      { upsert: true, new: true } // if user doesn't exist, create a new one
    );

    await user.save();
    return user;
  } catch (error) {
    console.error('wrongggggggggggggggggggg');
  }
};

export const deleteUser = async (id) => {
  try {
    await connectToDatabase();
    await User.findOneAndDelete({ clerkId: id });
  } catch (error) {
    console.error('wrongggggggggggggggggggg');
  }
};
