import { userProfile } from "@/lib/userProfile";
import { connectToDB } from "@/lib/dbConnection";
import {
  Channel,
  Member,
  Server,
  MemberRole,
  Profile,
} from "@/lib/modals/modals";

import { NextResponse } from "next/server";
import crypto from "crypto";

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
      role: MemberRole.ADMIN,
      profileId: profile._id,
    });

    const newServer = await Server.create({
      name: serverName,
      imageUrl,
      inviteCode: crypto.randomUUID(),
      authorId: profile._id,
      channels: [newChannel],
      members: [newMember],
    });

    if (newServer) {
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
