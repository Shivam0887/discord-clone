import { getAuth } from "@clerk/nextjs/server";
import { connectToDB } from "./dbConnection";
import { Profile } from "./modals/modals";
import { NextApiRequest } from "next";

export const userProfilePages = async (req: NextApiRequest) => {
  const { userId } = getAuth(req);

  if (!userId) return null;

  try {
    connectToDB();
    const profile = await Profile.findOne({ userId: userId });

    return profile;
  } catch (error: any) {
    console.log(error.message);
  }
};
