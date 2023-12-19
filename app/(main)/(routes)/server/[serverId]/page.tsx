import { connectToDB } from "@/lib/dbConnection";
import { Server } from "@/lib/modals/modals";
import { userProfile } from "@/lib/userProfile";
import { redirectToSignIn } from "@clerk/nextjs";
import { Types } from "mongoose";
import { redirect } from "next/navigation";

const ServerIdPage = async ({ params }: { params: { serverId: string } }) => {
  const profile = await userProfile();
  if (!profile) return redirectToSignIn();

  connectToDB();
  const server = await Server.aggregate([
    {
      $match: { _id: new Types.ObjectId(params.serverId) },
    },
    {
      $lookup: {
        from: "members",
        localField: "_id",
        foreignField: "serverId",
        pipeline: [
          {
            $match: {
              profileId: profile?._id,
            },
          },
          {
            $lookup: {
              from: "channels",
              localField: "serverId",
              foreignField: "serverId",
              pipeline: [
                {
                  $match: {
                    name: "general",
                  },
                },
                {
                  $project: { _id: 1, name: 1 },
                },
              ],
              as: "channels",
            },
          },
          {
            $unwind: "$channels",
          },
        ],
        as: "members",
      },
    },
    {
      $unwind: "$members",
    },
    {
      $project: { members: 1 },
    },
  ]).then((res) => res?.[0]);

  const initialChannel = server?.members?.channels;

  if (initialChannel?.name !== "general") return null;

  return redirect(
    `/server/${params.serverId}/channels/${initialChannel?._id?.toString()}`
  );
};

export default ServerIdPage;
