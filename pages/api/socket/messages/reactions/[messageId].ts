import { connectToDB } from "@/lib/dbConnection";
import { Channel, Message, Reaction, Server } from "@/lib/modals/modals";
import { userProfilePages } from "@/lib/userProfilePages";
import {
  MemberType,
  MessageType,
  NextApiResponseWithServerIO,
  ReactionType,
} from "@/types";
import { Types } from "mongoose";
import { NextApiRequest } from "next";

type ReactionToMessage = {
  messageId: string;
  emoji: string;
  user: {
    channelId: string;
    memberId: string;
    profileId: string;
    role: string;
    name: string;
    imageUrl: string;
  };
  channelId: string;
};

// Function to add a reaction to a message
async function addReactionToMessage({
  messageId,
  emoji,
  user,
  channelId,
}: ReactionToMessage) {
  try {
    const messageObjectId = new Types.ObjectId(messageId);
    const channelObjectId = new Types.ObjectId(channelId);

    let message = await Message.aggregate([
      {
        $match: {
          _id: messageObjectId,
          channelId: channelObjectId,
        },
      },
      {
        $lookup: {
          from: "reactions",
          localField: "reactions",
          foreignField: "_id",
          let: { emoji: emoji },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$emoji", "$$emoji"],
                },
              },
            },
          ],
          as: "reaction",
        },
      },
      {
        $unwind: "$reaction",
      },
    ]).then((res) => res?.[0]);

    if (!message?._id) {
      const reaction = await Reaction.create({
        emoji,
        users: [user],
      });

      message = await Message.findByIdAndUpdate(
        messageId,
        {
          $push: { reactions: reaction?._id },
        },
        { new: true, timestamps: false }
      );

      await Reaction.findByIdAndUpdate(
        reaction._id,
        {
          $set: {
            message: message?._id,
          },
        },
        { timestamps: false }
      );
    } else {
      const reaction = message.reaction;
      const isUserExists = reaction.users.findIndex(
        (data: any) => data.memberId === user.memberId
      );

      if (isUserExists === -1) {
        await Reaction.findByIdAndUpdate(reaction._id, {
          $push: {
            users: user,
          },
        });
      }
    }

    message = await Message.findOne({
      _id: message?._id,
      channelId: channelObjectId,
    }).populate({
      path: "reactions",
      model: Reaction,
    });

    return message;
  } catch (error) {
    console.error("Error adding reaction:", error);
  }
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponseWithServerIO
) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const profile = await userProfilePages(req);
    if (!profile) return res.status(401).json({ error: "Unauthorized" });

    const { messageId, serverId, channelId } = req.query;
    const { emoji }: { emoji: string } = req.body;

    const serverObjectId = new Types.ObjectId(serverId as string);
    const channelObjectId = new Types.ObjectId(channelId as string);
    const messageObjectId = new Types.ObjectId(messageId as string);

    if (!serverId) return res.status(401).json({ error: "Unauthorized" });
    if (!channelId) return res.status(401).json({ error: "Unauthorized" });

    connectToDB();
    const server = await Server.aggregate([
      {
        $match: { _id: serverObjectId },
      },
      {
        $lookup: {
          from: "members",
          localField: "members",
          foreignField: "_id",
          let: { profileId: profile?._id },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$profileId", "$$profileId"],
                },
              },
            },
            {
              $lookup: {
                from: "profiles",
                localField: "profileId",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      name: 1,
                      imageUrl: 1,
                    },
                  },
                ],
                as: "profileId",
              },
            },
            {
              $unwind: "$profileId",
            },
            {
              $project: {
                profileId: 1,
                role: 1,
              },
            },
          ],
          as: "members",
        },
      },
      {
        $unwind: "$members",
      },
      {
        $project: { channels: 0 },
      },
    ]).then((res) => res?.[0]);

    if (!server?._id) {
      return res.status(404).json({ message: "server not found" });
    }

    const channel = await Channel.find({
      _id: channelId,
      serverId: serverObjectId,
    });

    if (!channel?.length) {
      return res.status(404).json({ message: "channel not found" });
    }

    const member = server?.members;

    let message = await Message.findOne({
      _id: messageObjectId,
      channelId: channelObjectId,
    });

    if (!message?._id || message.isDeleted)
      return res.status(404).json({ message: "message not found" });

    const { profileId } = member;

    message = await addReactionToMessage({
      messageId: message?._id?.toString(),
      channelId: channelId as string,
      emoji,
      user: {
        channelId: channelId as string,
        memberId: member._id?.toString(),
        imageUrl: profileId?.imageUrl,
        name: profileId?.name,
        profileId: profileId?._id?.toString(),
        role: member?.role,
      },
    });

    const resp: MessageType = {
      _id: message?._id,
      content: message?.content,
      fileUrl: message?.fileUrl,
      memberId: server?.members,
      channelId: message?.channelId,
      isDeleted: message?.isDeleted,
      reply: message?.reply,
      isReply: message?.isReply,
      reactions: message?.reactions,
      createdAt: message?.createdAt,
      updatedAt: message?.updatedAt,
    };

    const updateKey = `chat:${channelId as string}:messages:update`;
    res?.socket?.server?.io?.emit(updateKey, resp);

    return res.status(200).json(resp);
  } catch (error: any) {
    console.log("Error while reacting", error.message);
    return res.status(500).json({ error: "Internal error" });
  }
}
