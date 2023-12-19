import { userProfile } from "@/lib/userProfile";
import { connectToDB } from "@/lib/dbConnection";
import { NextResponse } from "next/server";
import { DirectMessageType } from "@/types";
import { DirectMessage, Member, Profile } from "@/lib/modals/modals";

const MESSAGES_BATCH = 10;

export async function GET(req: Request) {
  try {
    const profile = await userProfile();
    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("cursor");
    const conversationId = searchParams.get("conversationId");

    if (!profile) return new NextResponse("Unauthorized", { status: 401 });
    if (!conversationId)
      return new NextResponse("conversation id is missing", { status: 400 });

    let messages: DirectMessageType[] = [];

    connectToDB();

    if (cursor) {
      messages = await DirectMessage.find({ conversationId: conversationId })
        .sort({ createdAt: "desc" })
        .where({ createdAt: { $lt: cursor } })
        .limit(MESSAGES_BATCH)
        .populate({
          path: "memberId",
          model: Member,
          select: "_id profileId role",
          populate: {
            path: "profileId",
            model: Profile,
            select: "_id name imageUrl",
          },
        });
    } else {
      messages = await DirectMessage.find({ conversationId: conversationId })
        .sort({ createdAt: "desc" })
        .limit(MESSAGES_BATCH)
        .populate({
          path: "memberId",
          model: Member,
          select: "_id profileId role",
          populate: {
            path: "profileId",
            model: Profile,
            select: "_id name imageUrl",
          },
        });
    }

    let nextCursor = null;

    if (messages.length) {
      const len = messages.length;
      nextCursor = messages[len - 1]?.createdAt?.toISOString();
    }

    return NextResponse.json({
      data: messages,
      nextCursor,
    });
  } catch (error: any) {
    console.log("Error while fetching messages", error.message);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
