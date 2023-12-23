import { Schema, models, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { string } from "zod";

// Profile schema
const profileSchema = new Schema(
  {
    userId: String,
    name: String,
    imageUrl: String,
    email: String,
    server: [
      {
        type: Schema.Types.ObjectId,
        ref: "Server",
      },
    ],
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
    channels: [
      {
        type: Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
  },
  { timestamps: true }
);

// Server schema
const serverSchema = new Schema(
  {
    name: String,
    imageUrl: String,
    inviteCode: {
      type: String,
      unique: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
    channels: [
      {
        type: Schema.Types.ObjectId,
        ref: "Channel",
      },
    ],
  },
  { timestamps: true }
);

const memberSchema = new Schema(
  {
    role: {
      type: String,
      default: "GUEST",
    },
    profileId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
    },
    serverId: {
      type: Schema.Types.ObjectId,
      ref: "Server",
    },
    channelMessages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
    directMessages: [{ type: Schema.Types.ObjectId, ref: "DirectMessage" }],
    conversationsInitiated: [
      { type: Schema.Types.ObjectId, ref: "Conversation" },
    ],
    conversationsReceived: [
      { type: Schema.Types.ObjectId, ref: "Conversation" },
    ],
  },
  { timestamps: true }
);

// Channel schema
enum ChannelT {
  TEXT = "TEXT",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
}

const channelSchema = new Schema(
  {
    name: String,
    type: {
      type: String,
      default: ChannelT.TEXT,
    },
    profileId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
    },
    serverId: {
      type: Schema.Types.ObjectId,
      ref: "Server",
    },
    channelMessages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true }
);

const reactionSchema = new Schema(
  {
    emoji: String,
    users: [
      {
        channelId: {
          type: String,
          required: false,
        },
        conversationId: {
          type: String,
          required: false,
        },
        memberId: String,
        profileId: String,
        role: String,
        name: String,
        imageUrl: String,
      },
    ],
    message: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      required: false,
    },
    directMessage: {
      type: Schema.Types.ObjectId,
      ref: "DirectMessage",
      required: false,
    },
  },
  { timestamps: true }
);

const replySchema = new Schema(
  {
    channelId: {
      type: String,
      required: false,
    },
    conversationId: {
      type: String,
      required: false,
    },
    imageUrl: String,
    memberId_repliedTo: String,
    memberId_repliedFrom: String,
    messageId_repliedTo: String,
    serverId: String,
    name: String,
    content: String,
    message: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      required: false,
    },
    directMessage: {
      type: Schema.Types.ObjectId,
      ref: "DirectMessage",
      required: false,
    },
  },
  { timestamps: true }
);

// This model is used to store the messages b/w a channel and a user.
const messageSchema = new Schema(
  {
    content: String,
    fileUrl: {
      type: String,
      required: false,
    },
    // Who send that message?
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
    },
    channelId: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
    },
    reactions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Reaction",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    reply: {
      type: Schema.Types.ObjectId,
      ref: "Reply",
    },
    isReply: Boolean,
  },
  { timestamps: true }
);

// This model is used to store the users who are engaged in a conversation.
const conversationSchema = new Schema({
  memberOneId: {
    type: Schema.Types.ObjectId,
    unique: true,
    ref: "Member",
  },
  memberTwoId: {
    type: Schema.Types.ObjectId,
    unique: true,
    ref: "Member",
  },
  directMessages: [{ type: Schema.Types.ObjectId, ref: "DirectMessage" }],
});

// This model is used to store the messages transmitted b/w two users.
const directMessageSchema = new Schema(
  {
    content: String,
    fileUrl: {
      type: String,
      required: false,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
    },
    reactions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Reaction",
      },
    ],
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    reply: {
      type: Schema.Types.ObjectId,
      ref: "Reply",
    },
    isReply: Boolean,
  },
  { timestamps: true }
);

const Profile = models?.Profile || model("Profile", profileSchema);
const Server = models?.Server || model("Server", serverSchema);
const Member = models?.Member || model("Member", memberSchema);
const Channel = models?.Channel || model("Channel", channelSchema);
const Message = models?.Message || model("Message", messageSchema);
const Reply = models?.Reply || model("Reply", replySchema);
const Reaction = models?.Reaction || model("Reaction", reactionSchema);
const Conversation =
  models?.Conversation || model("Conversation", conversationSchema);
const DirectMessage =
  models?.DirectMessage || model("DirectMessage", directMessageSchema);

export {
  Profile,
  Server,
  Member,
  Channel,
  ChannelT,
  Message,
  Conversation,
  DirectMessage,
  Reply,
  Reaction,
};
