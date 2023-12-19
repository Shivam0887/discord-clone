import { connectToDB } from "@/lib/dbConnection";
import {
  Channel,
  Conversation,
  DirectMessage,
  Member,
  Message,
  Profile,
  Server,
} from "@/lib/modals/modals";
import { userProfilePages } from "@/lib/userProfilePages";
import { DirectMessageType, NextApiResponseWithServerIO } from "@/types";
import { Types } from "mongoose";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseWithServerIO
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const profile = await userProfilePages(req);
    if (!profile) return res.status(401).json({ error: "Unauthorized" });

    const { content, fileUrl } = req.body;
    const { conversationId } = req.query;

    if (!conversationId)
      return res.status(400).json({ error: "Server id is missing" });

    const conversationObjectId = new Types.ObjectId(conversationId as string);

    connectToDB();

    const conversation = await Conversation.findById(conversationObjectId, {
      directMessages: 0,
    });

    let member = null;
    if (conversation?._id) {
      const isMemberOne = await Member.findOne(
        {
          _id: conversation.memberOneId,
          profileId: profile?._id,
        },
        { profileId: 1, role: 1 }
      ).populate({
        path: "profileId",
        model: Profile,
        select: "_id name imageUrl",
      });
      const isMemberTwo = await Member.findOne(
        {
          _id: conversation.memberTwoId,
          profileId: profile?._id,
        },
        { profileId: 1, role: 1 }
      ).populate({
        path: "profileId",
        model: Profile,
        select: "_id name imageUrl",
      });

      member = isMemberOne?._id ? isMemberOne : isMemberTwo;
    } else {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!member) {
      return res.status(404).json({ message: "message not found" });
    }

    const message = await DirectMessage.create({
      content,
      fileUrl,
      memberId: member?._id,
      conversationId: conversationObjectId,
    });

    await Conversation.findByIdAndUpdate(conversationObjectId, {
      $push: {
        directMessages: message?._id,
      },
    });

    const sender =
      member?._id === conversation?.memberOneId
        ? conversation?.memberOneId
        : conversation?.memberTwoId;
    const receiver =
      sender === conversation?.memberOneId
        ? conversation?.memberTwoId
        : conversation?.memberOneId;

    await Member.findByIdAndUpdate(sender, {
      $push: {
        conversationsInitiated: conversationObjectId,
      },
    });
    await Member.findByIdAndUpdate(receiver, {
      $push: {
        conversationsReceived: conversationObjectId,
      },
    });

    const resp: DirectMessageType = {
      _id: message?._id,
      content: message?.content,
      fileUrl: message?.fileUrl,
      memberId: member,
      conversationId: message?.conversationId,
      isDeleted: message?.isDeleted,
      createdAt: message?.createdAt,
      updatedAt: message?.updatedAt,
    };

    const channelKey = `chat:${conversationId as string}:messages`;

    res?.socket?.server?.io?.emit(channelKey, resp);

    return res.status(201).json(resp);
  } catch (error: any) {
    console.log("Message_Post ", error.message);
    return res.status(500).json({ message: "Internal error" });
  }
}
