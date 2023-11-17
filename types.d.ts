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
  authorId: string;
  members: MemberType[];
  channels: ChannelType[];
};

export type MemberType = {
  _id: string;
  role: string;
  profileId: string;
  serverId: string;
};

export type ChannelType = {
  _id: string;
  name: string;
  type: ChannelT.AUDIO | ChannelT.TEXT | ChannelT.VIDEO;
  profileId: string;
  serverId: string;
};
