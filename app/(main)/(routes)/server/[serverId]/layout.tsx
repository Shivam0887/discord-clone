import ServerSidebar from "@/components/server/ServerSidebar";
import { connectToDB } from "@/lib/dbConnection";
import { Server } from "@/lib/modals/modals";
import { userProfile } from "@/lib/userProfile";
import { redirectToSignIn } from "@clerk/nextjs";
import { Types } from "mongoose";
import { redirect } from "next/navigation";

const ServerIdLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { serverId: string };
}) => {
  const profile = await userProfile();
  if (!profile) redirectToSignIn();

  let server = null;
  try {
    connectToDB();
    server = await Server.aggregate([
      {
        $match: { _id: new Types.ObjectId(params.serverId) },
      },
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
        $unwind: "$members",
      },
      {
        $match: {
          "members.profileId": profile?._id,
        },
      },
      {
        $project: { _id: 1 },
      },
    ]).then((res) => (res.length ? res[0] : null));
  } catch (error: any) {
    console.log("Error while fetching server : ", error.message);
  } finally {
    if (!server) return redirect("/");
  }

  return (
    <div className="h-full">
      <div className="hidden md:flex flex-col h-full w-60 fixed z-20 inset-y-0">
        <ServerSidebar serverId={server?._id.toString()} />
      </div>
      <main className="h-full md:pl-60">{children}</main>
    </div>
  );
};

export default ServerIdLayout;
