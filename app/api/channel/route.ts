import { connectToDB } from "@/lib/dbConnection";
import { Channel, Member, Profile, Server } from "@/lib/modals/modals";
import { userProfile } from "@/lib/userProfile";
import { MemberType } from "@/types";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const profile = await userProfile();
    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    const { channelName, channelType } = await req.json();
    const serverId = new URL(req.url).searchParams.get("serverId");

    if (!serverId?.length)
      return new NextResponse("server id is missing", { status: 400 });
    if (channelType?.toLowerCase() === "general")
      return new NextResponse("Channel name cannot be 'general'", {
        status: 400,
      });

    connectToDB();
    const serverObjectId = new Types.ObjectId(serverId);

    const server = await Server.findOne({
      _id: serverObjectId,
    }).populate({
      path: "members",
      model: Member,
      select: "_id role",
    });

    if (!server?.name)
      return new NextResponse("Server not found", { status: 404 });

    const isAdminOrModerator = server?.members.some(
      (member: MemberType) =>
        member.role === "ADMIN" || member.role === "MODERATOR"
    );

    if (isAdminOrModerator) {
      const newChannel = await Channel.create({
        name: channelName,
        type: channelType,
        serverId: serverObjectId,
        profileId: profile?._id,
      });

      await Server.findOneAndUpdate(
        { _id: serverObjectId },
        { $push: { channels: newChannel?._id } }
      );

      await Profile.findByIdAndUpdate(profile?._id, {
        $push: {
          channels: newChannel?._id,
        },
      });
    }

    return new NextResponse("channel created successfully", { status: 201 });
  } catch (error: any) {
    console.log("Error while creating a channel : ", error.message);
    return new NextResponse("Interval error", { status: 500 });
  }
}
