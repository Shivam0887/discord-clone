import { userProfile } from "@/lib/userProfile";
import { connectToDB } from "@/lib/dbConnection";
import { Channel, Member, Server, Profile } from "@/lib/modals/modals";

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Types } from "mongoose";
import { ServerType } from "@/types";

export async function POST(req: Request) {
  try {
    connectToDB();
    const { serverName, imageUrl } = await req.json();
    const profile = await userProfile();

    if (!profile) return new NextResponse("Unauthorized user", { status: 401 });

    const newChannel = await Channel.create({
      name: "general",
      profileId: profile._id,
    });

    const newMember = await Member.create({
      role: "ADMIN",
      profileId: profile?._id,
    });

    const newServer = await Server.create({
      name: serverName,
      imageUrl,
      inviteCode: crypto.randomUUID(),
      authorId: profile?._id,
      channels: [newChannel],
      members: [newMember],
    });

    if (newServer?.name) {
      await Member.findByIdAndUpdate(newMember._id, {
        $set: { serverId: newServer._id },
      });
      await Channel.findByIdAndUpdate(newChannel._id, {
        $set: { serverId: newServer._id },
      });
      await Profile.findByIdAndUpdate(profile._id, {
        $push: {
          server: newServer._id,
          members: newMember._id,
          channels: newChannel._id,
        },
      });
    }

    return NextResponse.json(newServer);
  } catch (error: any) {
    console.log("failed to create server ", error.message);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const profile = await userProfile();
    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    const serverId = new URL(req.url).searchParams.get("serverId");
    if (!serverId)
      return new NextResponse("server id is missing", { status: 400 });

    const serverObjectId = new Types.ObjectId(serverId);

    await Profile.findByIdAndUpdate(profile?._id, {
      $pull: {
        server: serverObjectId,
      },
    });

    const deletedChannels = await Channel.find(
      { profileId: profile?._id, serverId: serverObjectId },
      { _id: 1 }
    );
    const deletedMembers = await Member.find(
      { profileId: profile?._id, serverId: serverObjectId },
      { _id: 1 }
    );

    deletedChannels.forEach(
      async (channel) =>
        await Profile.findByIdAndUpdate(profile?._id, {
          $pull: {
            channels: channel._id,
          },
        })
    );

    deletedMembers.forEach(
      async (member) =>
        await Profile.findByIdAndUpdate(profile?._id, {
          $pull: {
            members: member._id,
          },
        })
    );

    await Server.findByIdAndDelete(serverId);
    await Channel.deleteMany({
      profileId: profile?._id,
      serverId: serverObjectId,
    });
    await Member.deleteMany({
      profileId: profile?._id,
      serverId: serverObjectId,
    });

    return new NextResponse("server deleted successfully", { status: 200 });
  } catch (error: any) {
    console.log(
      "Error while deleting the server at server-side",
      error.message
    );
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const profile = await userProfile();
  if (!profile?._id) return NextResponse.redirect(new URL("/sign-in", req.url));

  const serverId = new URL(req.url).searchParams.get("serverId");

  try {
    connectToDB();
    const server = await Server.findById(serverId)
      .populate({
        path: "members",
        model: Member,
        populate: {
          path: "profileId",
          model: Profile,
          select: "_id name imageUrl email",
        },
        options: { sort: { role: 1 } },
      })
      .populate({
        path: "channels",
        model: Channel,
        options: { sort: { createdAt: 1 } },
      })
      .exec();

    return NextResponse.json({ server, profile }, { status: 200 });
  } catch (error: any) {
    console.log("Error while fetching server : ", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
