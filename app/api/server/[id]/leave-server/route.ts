import { Member, Profile, Server } from "@/lib/modals/modals";
import { userProfile } from "@/lib/userProfile";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profile = await userProfile();
    const serverId = params.id;

    if (!profile) return new NextResponse("Unauthorized", { status: 401 });
    if (!serverId)
      return new NextResponse("server id missing", { status: 400 });

    const serverObjectId = new Types.ObjectId(serverId);
    const member = await Server.aggregate([
      {
        $match: { _id: serverObjectId },
      },
      {
        $lookup: {
          localField: "members",
          foreignField: "_id",
          from: "members",
          as: "members",
        },
      },
      {
        $unwind: "$members",
      },
      {
        $match: {
          $and: [
            { "members.serverId": { $eq: serverObjectId } },
            { "members.profileId": { $eq: profile?._id } },
          ],
        },
      },
      {
        $project: { members: 1, _id: 0 },
      },
    ]).then((res) => res?.[0].members);

    await Member.findByIdAndDelete(member?._id);
    await Profile.findByIdAndUpdate(member?.profileId, {
      $pull: {
        members: member?._id,
        server: serverObjectId,
      },
    });

    await Server.findByIdAndUpdate(member?.serverId, {
      $pull: {
        members: member?._id,
      },
    });

    return new NextResponse("left server successfully", { status: 200 });
  } catch (error: any) {
    console.log("Error while removing the member at server", error.message);
    return new NextResponse("Internal error", { status: 500 });
  }
}
