import { connectToDB } from "@/lib/dbConnection";
import { Channel, Message, Server } from "@/lib/modals/modals";
import { userProfilePages } from "@/lib/userProfilePages";
import { MessageType, NextApiResponseWithServerIO } from "@/types";
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
    if (!profile) return res.status(401).json({ error: "Unauthorized" });

    const { messageId, serverId, channelId } = req.query;

    const { content } = req.body;

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

    if (!server?._id)
      return res.status(404).json({ message: "server not found" });

    const channel = await Channel.find({
      _id: channelId,
      serverId: serverObjectId,
    });

    if (!channel?.length)
      return res.status(404).json({ message: "channel not found" });

    const member = server?.members;

    let message = await Message.findOne({
      _id: messageObjectId,
      channelId: channelObjectId,
    });

    if (!message?._id || message.isDeleted)
      return res.status(404).json({ message: "message not found" });

    const isSender = String(message?.memberId) === String(member?._id);
    const isAdmin = member?.role === "ADMIN";
    const isModerator = member?.role === "MODERATOR";
    const canModify = isSender || isAdmin || isModerator;

    if (!canModify) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method === "DELETE") {
      message = await Message.findByIdAndUpdate(
        message._id,
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
      if (!isSender) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      message = await Message.findByIdAndUpdate(
        message?._id,
        {
          $set: {
            content,
          },
        },
        { new: true }
      );
    }

    const resp: MessageType = {
      _id: message?._id,
      content: message?.content,
      fileUrl: message?.fileUrl,
      memberId: server?.members,
      channelId: message?.channelId,
      isDeleted: message?.isDeleted,
      createdAt: message?.createdAt,
      updatedAt: message?.updatedAt,
    };

    const updateKey = `chat:${channelId}:messages:update`;
    res?.socket?.server?.io?.emit(updateKey, resp);

    return res.status(200).json(resp);
  } catch (error: any) {
    console.log("Error while editing the message on server", error?.message);
    return res.status(500).json({ error: "Internal error" });
  }
}
