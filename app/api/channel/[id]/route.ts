import { Channel, Member, Profile, Server } from "@/lib/modals/modals";
import { userProfile } from "@/lib/userProfile";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const profile = await userProfile();
    const serverId = new URL(req.url).searchParams.get("serverId");

    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    if (!params.id)
      return new NextResponse("channel id is missing", { status: 400 });
    if (!serverId)
      return new NextResponse("server id is missing", { status: 400 });

    const channelObjectId = new Types.ObjectId(params.id);
    const serverObjectId = new Types.ObjectId(serverId);

    const server = await Server.findById(serverObjectId).populate({
      path: "members",
      model: Member,
      match: {
        profileId: profile?._id,
        role: { $in: ["ADMIN", "MODERATOR"] },
      },
    });

    if (server?._id) {
      await Server.findOneAndUpdate(
        { _id: serverObjectId },
        {
          $pull: {
            channels: channelObjectId,
          },
        }
      );

      await Profile.findByIdAndUpdate(profile?._id, {
        $pull: {
          channels: channelObjectId,
        },
      });

      await Channel.findOneAndDelete({
        _id: channelObjectId,
        serverId: serverObjectId,
      });
    }

    return new NextResponse("channel deleted successfully", { status: 200 });
  } catch (error: any) {
    console.log("error while deleting channel", error.message);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const profile = await userProfile();
    const serverId = new URL(req.url).searchParams.get("serverId");
    const { channelName, channelType } = await req.json();

    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    if (!params.id)
      return new NextResponse("channel id is missing", { status: 400 });
    if (!serverId)
      return new NextResponse("server id is missing", { status: 400 });

    if (channelName === "general")
      return new NextResponse("channel name cannot be 'general'", {
        status: 400,
      });

    const channelObjectId = new Types.ObjectId(params.id);
    const serverObjectId = new Types.ObjectId(serverId);

    const server = await Server.findOne(
      {
        _id: serverObjectId,
      },
      { _id: 1 }
    ).populate({
      path: "members",
      model: Member,
      match: {
        profileId: profile?._id,
        role: { $in: ["ADMIN", "MODERATOR"] },
      },
    });

    if (server?._id) {
      await Channel.findOneAndUpdate(
        {
          _id: channelObjectId,
          serverId: serverObjectId,
          name: { $ne: "general" },
        },
        {
          $set: {
            name: channelName,
            type: channelType,
          },
        }
      );
    }

    return new NextResponse("channel edited successfully", { status: 200 });
  } catch (error: any) {
    console.log("error while deleting channel", error.message);
    return new NextResponse("Internal error", { status: 500 });
  }
}
