import { connectToDB } from "@/lib/dbConnection";
import { Channel, Member, Message, Reply, Server } from "@/lib/modals/modals";
import { userProfilePages } from "@/lib/userProfilePages";
import { MessageType, NextApiResponseWithServerIO, ReplyType } from "@/types";
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
    if (!profile?._id) return res.status(401).json({ error: "Unauthorized" });

    const { content, fileUrl, isReply, reply } = req.body;

    const { serverId, channelId } = req.query;

    if (!serverId)
      return res.status(400).json({ error: "Server id is missing" });
    if (!channelId)
      return res.status(400).json({ error: "Channel id is missing" });
    if (!content && !fileUrl)
      return res.status(400).json({ error: "Message content is missing" });

    const serverObjectId = new Types.ObjectId(serverId as string);
    const channelObjectId = new Types.ObjectId(channelId as string);

    connectToDB();
    const server = await Server.aggregate([
      {
        $match: {
          _id: serverObjectId,
        },
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
      return res.status(404).json({ message: "Server not found" });
    if (!server?.members?._id)
      return res.status(404).json({ message: "Member not found" });

    const channel = await Channel.findOne({
      _id: channelObjectId,
      serverId: serverObjectId,
    });

    if (!channel?._id)
      return res.status(404).json({ message: "Channel not found" });

    let newReply;
    if (isReply) {
      reply.memberId_repliedFrom = server?.members?._id.toString();
      newReply = await Reply.create(reply);
    }

    let message = await Message.create({
      content,
      fileUrl,
      isReply,
      reply: newReply?._id,
      memberId: server?.members?._id,
      channelId: channelObjectId,
    });

    if (isReply) {
      await Reply.findByIdAndUpdate(
        newReply?._id,
        {
          $set: {
            message: message?._id,
          },
        },
        { timestamps: false }
      );
      message = await Message.findById(message?._id).populate({
        path: "reply",
        model: Reply,
      });
    }

    await Member.findByIdAndUpdate(
      server?.members?._id,
      {
        $push: {
          channelMessages: message?._id,
        },
      },
      { timestamps: false }
    );

    const resp = {
      _id: message?._id,
      content: message?.content,
      fileUrl: message?.fileUrl,
      memberId: server?.members,
      channelId: message?.channelId,
      isDeleted: message?.isDeleted,
      reply: message?.reply,
      isReply: message?.isReply,
      createdAt: message?.createdAt,
      updatedAt: message?.updatedAt,
    };

    const channelKey = `chat:${channelId}:messages`;

    res?.socket?.server?.io?.emit(channelKey, resp);

    return res.status(201).json(resp);
  } catch (error: any) {
    console.log("Message_Post ", error.message);
    return res.status(500).json({ message: "Internal error" });
  }
}
