import { connectToDB } from "@/lib/dbConnection";
import { Channel, ChannelT, Member, Server } from "@/lib/modals/modals";
import { userProfile } from "@/lib/userProfile";
import { ServerType, ChannelType, MemberType } from "@/types";
import { redirect } from "next/navigation";
import ServerHeader from "./ServerHeader";

const ServerSidebar = async ({ serverId }: { serverId: string }) => {
  const profile = await userProfile();
  if (!profile) return redirect("/");

  let server: ServerType | null = null;
  try {
    connectToDB();
    server = await Server.findById(serverId)
      .populate({
        path: "members",
        model: Member,
        options: { sort: { role: 1 } },
      })
      .populate({
        path: "channels",
        model: Channel,
        options: { sort: { createdAt: 1 } },
      })
      .exec();
  } catch (error: any) {
    console.log("Error while fetching server : ", error.message);
  } finally {
    if (!server) return redirect("/");
  }

  const textChannels: ChannelType[] = [];
  const audioChannels: ChannelType[] = [];
  const videoChannels: ChannelType[] = [];

  server?.channels.forEach((channel) => {
    if (channel.type === ChannelT.TEXT) textChannels.push(channel);
    else if (channel.type === ChannelT.AUDIO) audioChannels.push(channel);
    else videoChannels.push(channel);
  });

  const members: MemberType[] = [];
  let role: string | undefined;

  server?.members.forEach((member) => {
    if (member.profileId.toString() === profile?._id.toString())
      role = member.role;
    else members.push(member);
  });

  return (
    <div className="flex flex-col h-full w-full text-primary dark:bg-[#2B2D31] bg-[#F2F3F5]">
      {server && <ServerHeader server={JSON.stringify(server)} role={role} />}
    </div>
  );
};

export default ServerSidebar;
