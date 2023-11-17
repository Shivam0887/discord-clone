import { auth } from "@clerk/nextjs";
import { connectToDB } from "./dbConnection";
import { Profile } from "./modals/modals";

export const userProfile = async () => {
  const { userId } = auth();

  if (!userId) return null;

  try {
    connectToDB();
    const profile = await Profile.findOne({ userid: userId });

    return profile;
  } catch (error: any) {
    console.log(error.message);
  }
};
