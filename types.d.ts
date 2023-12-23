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

export type ReactionType = {
  _id?: Schema.Types.ObjectId;
  emoji: string;
  channelId?: string;
  conversationId?: string;
  users: {
    memberId: string;
    profileId: string;
    role: string;
    name: string;
    imageUrl: string;
  }[];
};

export type ReplyType = {
  _id?: Schema.Types.ObjectId;
  channelId?: string;
  conversationId?: string;
  memberId_repliedTo: string;
  memberId_repliedFrom: string;
  messageId_repliedTo: string;
  serverId: string;
  name: string;
  content: string;
  imageUrl: string;
};

export type MessageType = {
  _id?: Schema.Types.ObjectId;
  content: string;
  fileUrl?: string;
  memberId: string | MemberType;
  channelId: string;
  isDeleted: boolean;
  isReply: Boolean;
  reactions: ReactionType[];
  reply: ReplyType;
  createdAt: Date;
  updatedAt: Date;
};

export type DirectMessageType = {
  _id?: Schema.Types.ObjectId;
  content: string;
  fileUrl?: string;
  memberId: string | MemberType;
  conversationId: string;
  isDeleted: boolean;
  reactions: ReactionType[];
  reply: ReplyType;
  isReply: Boolean;
  createdAt: Date;
  updatedAt: Date;
};
