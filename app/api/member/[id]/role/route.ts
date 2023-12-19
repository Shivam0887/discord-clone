import { connectToDB } from "@/lib/dbConnection";
import { Server, Profile, Member } from "@/lib/modals/modals";
import { userProfile } from "@/lib/userProfile";
import { MemberType, ProfileType, ServerType } from "@/types";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profile = await userProfile();
    const role = req.nextUrl.searchParams.get("role");
    const serverId = req.nextUrl.searchParams.get("serverId");

    if (!profile) return new NextResponse("Unauthorized", { status: 401 });
    if (!params.id)
      return new NextResponse("member id missing", { status: 400 });
    if (!serverId)
      return new NextResponse("server id missing", { status: 400 });

    connectToDB();
    const servers = await Server.find({
      _id: new Types.ObjectId(serverId),
      authorId: new Types.ObjectId(profile?._id),
    }).populate({
      path: "members",
      model: Member,
      options: { sort: { role: 1 } },
      populate: {
        path: "profileId",
        model: Profile,
      },
    });

    const updatedServer = servers.map((server) => {
      server?.members.forEach(async (member: MemberType) => {
        if (
          member._id.toString() === params.id &&
          typeof member.profileId !== "string" &&
          member.profileId._id.toString() !== profile?._id?.toString()
        ) {
          member.role = role!;
          const filteredMember = await Member.findById(member._id);
          filteredMember.role = role;
          await filteredMember.save();
        }
      });

      return server;
    });

    console.log();

    return NextResponse.json(updatedServer[0], { status: 200 });
  } catch (error) {
    console.log("Error in updating member role on server");
    return new NextResponse("Internal error", { status: 500 });
  }
}
