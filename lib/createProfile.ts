import { connectToDB } from "@/lib/dbConnection";
import { Profile } from "@/lib/modals/modals";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export const createProfile = async () => {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");

  try {
    connectToDB();
    const profile = await Profile.findOne({ userId: user?.id });
    if (profile?.userId) return profile;

    // creating a new profile
    const newProfile = await Profile.create({
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
    });

    return newProfile;
  } catch (error: any) {
    console.log("Failed to create profile: ", error.message);
  }
};
