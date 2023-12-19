import { connectToDB } from "@/lib/dbConnection";
import {
  Channel,
  Conversation,
  DirectMessage,
  Member,
  Profile,
} from "@/lib/modals/modals";
import { userProfilePages } from "@/lib/userProfilePages";
import { DirectMessageType, NextApiResponseWithServerIO } from "@/types";
import { Types } from "mongoose";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseWithServerIO
) {
  if (req.method !== "DELETE" && req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const profile = await userProfilePages(req);
    if (!profile?._id) return res.status(401).json({ error: "Unauthorized" });

    const { directMessageId, conversationId } = req.query;
    const { content } = req.body;

    const id = conversationId as string;
    const messageId = directMessageId as string;

    const conversationObjectId = new Types.ObjectId(id);
    const directMessageObjectId = new Types.ObjectId(messageId as string);

    if (!id)
      return res.status(400).json({ error: "conversation id is missing" });

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

    if (!member) return res.status(404).json({ message: "message not found" });

    let message = await DirectMessage.findOne({
      _id: directMessageObjectId,
      conversationId: conversationObjectId,
    });

    if (message === null || message?.isDeleted)
      return res.status(404).json({ message: "message not found" });

    const isSender = message?.memberId === member?._id;
    const isAdmin = member?.role === "ADMIN";
    const isModerator = member?.role === "MODERATOR";
    const canModify = isSender || isAdmin || isModerator;

    if (!canModify) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method === "DELETE") {
      message = await DirectMessage.findByIdAndUpdate(
        message?._id,
        {
          $set: {
            fileUrl: "",
            content: "This message has been deleted.",
            isDeleted: true,
          },
        },
        { new: true }
      );
    }
    if (req.method === "PATCH") {
      if (isSender) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      message = await DirectMessage.findByIdAndUpdate(
        message?._id,
        {
          $set: {
            content,
          },
        },
        { new: true }
      );
    }

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

    const updateKey = `chat:${conversationId as string}:messages:update`;
    res?.socket?.server?.io?.emit(updateKey, resp);

    return res.status(200).json(resp);
  } catch (error: any) {
    console.log("Error while editing the message on server", error?.message);
    return res.status(500).json({ error: "Internal error" });
  }
}
