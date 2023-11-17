import { Schema, models, model } from "mongoose";

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
    inviteCode: String,
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

// Member schema
export enum MemberRole {
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  GUEST = "GUEST",
}

const memberSchema = new Schema(
  {
    role: {
      type: String,
      default: MemberRole.GUEST,
    },
    profileId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
    },
    serverId: {
      type: Schema.Types.ObjectId,
      ref: "Server",
    },
  },
  { timestamps: true }
);

// Channel schema
export enum ChannelT {
  TEXT = "TEXT",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
}

const channelSchema = new Schema(
  {
    name: String,
    type: {
      type: String,
      default: ChannelT.AUDIO,
    },
    profileId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
    },
    serverId: {
      type: Schema.Types.ObjectId,
      ref: "Server",
    },
  },
  { timestamps: true }
);

const Profile = models.Profile || model("Profile", profileSchema);
const Server = models.Server || model("Server", serverSchema);
const Member = models.Member || model("Member", memberSchema);
const Channel = models.Channel || model("Channel", channelSchema);

export { Profile, Server, Member, Channel };
