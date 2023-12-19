import InitialModal from "@/components/modals/InitialModal";
import { connectToDB } from "@/lib/dbConnection";
import { createProfile } from "@/lib/createProfile";
import { Profile, Server } from "@/lib/modals/modals";
import { redirect } from "next/navigation";

const SetupPage = async () => {
  const profile = await createProfile();

  // access the servers in which the current user has been joined
  let userServer: { _id: string } | null = null;

  try {
    connectToDB();
    const res = await Profile.findById(profile?._id, { _id: 0, server: 1 })
      .populate({
        path: "server",
        model: Server,
        select: "_id",
      })
      .limit(1);

    userServer = res?.server[0];
  } catch (error) {
    if (error instanceof Error)
      console.log("Failed to find server : ", error.message);
  }

  if (userServer?._id?.toString()) {
    return redirect(`/server/${userServer?._id?.toString()}`);
  }

  return <InitialModal />;
};

export default SetupPage;
