import { Member, Profile, Server } from "@/lib/modals/modals";
import { userProfile } from "@/lib/userProfile";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profile = await userProfile();
    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    const memberId = params.id;
    const serverId = new URL(req.url).searchParams.get("serverId");

    if (!serverId)
      return new NextResponse("server id missing", { status: 400 });
    if (!memberId)
      return new NextResponse("member id missing", { status: 400 });

    const memberObjectId = new Types.ObjectId(memberId);
    const serverObjectId = new Types.ObjectId(serverId);

    const deletedMember = await Member.findOneAndDelete(
      {
        _id: memberObjectId,
        serverId: serverObjectId,
        profileId: { $ne: profile?._id },
      },
      {
        profileId: 1,
      }
    );
    const updatedServer = await Server.findByIdAndUpdate(
      { _id: serverObjectId, authorId: profile?._id },
      {
        $pull: {
          members: deletedMember?._id,
        },
      },
      {
        new: true,
      }
    );
    await Profile.findByIdAndUpdate(deletedMember?.profileId, {
      $pull: {
        members: deletedMember?._id,
        server: serverObjectId,
      },
    });

    return new NextResponse(updatedServer, { status: 200 });
  } catch (error: any) {
    console.log("Error while removing the member at server", error.message);
    return new NextResponse("Internal error", { status: 500 });
  }
}
