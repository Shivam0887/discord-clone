import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import { Schema } from "mongoose";

export type ProfileType = {
  _id: string;
  userId: string;
  name: string;
  imageUrl: string;
  email: string;
  server: ServerType[];
  members: MemberType[];
  channels: ChannelType[];
};

export type ServerType = {
  _id: string;
  name: string;
  imageUrl: string;
  inviteCode: string;
  authorId: string | ProfileType;
  members: MemberType[];
  channels: ChannelType[];
};

export type MemberType = {
  _id: string;
  role: string;
  profileId: string | ProfileType;
  serverId: string | ServerType;
};

export type ChannelType = {
  _id: string;
  name: string;
  type: ChannelT.AUDIO | ChannelT.TEXT | ChannelT.VIDEO;
  profileId: string | ProfileType;
  serverId: string | ServerType;
};

export type NextApiResponseWithServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export type MessageType = {
  _id: Schema.Types.ObjectId;
  content: string;
  fileUrl?: string;
  memberId: string | MemberType;
  channelId: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type DirectMessageType = {
  _id: Schema.Types.ObjectId;
  content: string;
  fileUrl?: string;
  memberId: string;
  conversationId: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};
