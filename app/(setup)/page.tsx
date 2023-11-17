import InitialModal from "@/components/modals/InitialModal";
import { connectToDB } from "@/lib/dbConnection";
import { createProfile } from "@/lib/createProfile";
import { Server } from "@/lib/modals/modals";
import { redirect } from "next/navigation";

const SetupPage = async () => {
  const profile = await createProfile();

  // access the servers in which the current user has been joined
  let userServer: { _id: string } | null = null;

  try {
    connectToDB();
    userServer = await Server.aggregate([
      {
        $unwind: "$members",
      },
      {
        $lookup: {
          from: "members",
          localField: "members",
          foreignField: "_id",
          as: "members",
        },
      },
      {
        $match: {
          "members.profileId": profile?._id,
        },
      },
      {
        $limit: 1,
      },
    ]).then((res) => (res.length ? res[0] : null));
  } catch (error) {
    if (error instanceof Error)
      console.log("Failed to find server : ", error.message);
  }

  if (userServer) {
    return redirect(`/server/${userServer._id.toString()}`);
  }

  return <InitialModal />;
};

export default SetupPage;
