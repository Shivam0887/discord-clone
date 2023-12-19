import { connectToDB } from "@/lib/dbConnection";
import { Channel, Member, Profile, Server } from "@/lib/modals/modals";
import { userProfile } from "@/lib/userProfile";
import { ServerType, ChannelType, MemberType } from "@/types";
import { redirect } from "next/navigation";
import ServerHeader from "./ServerHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import ServerSearch from "./ServerSearch";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";
import { Separator } from "../ui/separator";
import ServerSection from "./ServerSection";
import ServerChannels from "./ServerChannels";
import ServerMembers from "./ServerMembers";

const iconMap: { [type: string]: React.ReactNode } = {
  TEXT: <Hash className="mr-2 h-4 w-4" />,
  AUDIO: <Mic className="mr-2 h-4 w-4" />,
  VIDEO: <Video className="mr-2 h-4 w-4" />,
};

const roleIconMap: { [type: string]: React.ReactNode } = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 mr-2 text-rose-500" />,
};

const ServerSidebar = ({ _server, profileId }: { _server: string, profileId: string }) => {
  const server: ServerType = JSON.parse(_server)

  const textChannels: ChannelType[] = [];
  const audioChannels: ChannelType[] = [];
  const videoChannels: ChannelType[] = [];

  server?.channels.forEach((channel) => {
    if (channel.type === "TEXT") textChannels.push(channel);
    else if (channel.type === "AUDIO") audioChannels.push(channel);
    else videoChannels.push(channel);
  });

  const members: MemberType[] = [];
  let role: string | undefined;

  server?.members.forEach((member) => {
    if (
      typeof member?.profileId !== "string" &&
      member.profileId._id.toString() === profileId
    )
      role = member.role;
    else members.push(member);
  });

  return (
    <div className="flex flex-col h-full w-full text-primary dark:bg-[#2B2D31] bg-[#F2F3F5]">
      {server && <ServerHeader server={JSON.stringify(server)} role={role} />}
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <ServerSearch
            data={[
              {
                label: "Text Channels",
                type: "channel",
                data: textChannels.map((channel) => ({
                  id: channel._id.toString(),
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Voice Channels",
                type: "channel",
                data: audioChannels.map((channel) => ({
                  id: channel._id.toString(),
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Video Channels",
                type: "channel",
                data: videoChannels.map((channel) => ({
                  id: channel._id.toString(),
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Members",
                type: "member",
                data: members.map((member) => ({
                  id: member._id.toString(),
                  name:
                    typeof member.profileId !== "string"
                      ? member.profileId.name
                      : "",
                  icon: roleIconMap[member.role],
                })),
              },
            ]}
          />
        </div>
        <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />
        {!!textChannels.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType="TEXT"
              role={role}
              label="Text Channels"
            />
            {textChannels.map((channel) => (
              <ServerChannels
                key={channel?._id?.toString()}
                channel={JSON.stringify(channel)}
                server={JSON.stringify(server)}
                role={role}
              />
            ))}
          </div>
        )}
        {!!audioChannels.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType="AUDIO"
              role={role}
              label="Voice Channels"
            />
            {audioChannels.map((channel) => (
              <ServerChannels
                key={channel?._id?.toString()}
                channel={JSON.stringify(channel)}
                server={JSON.stringify(server)}
                role={role}
              />
            ))}
          </div>
        )}
        {!!videoChannels.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType="VIDEO"
              role={role}
              label="Video Channels"
            />
            {videoChannels.map((channel) => (
              <ServerChannels
                key={channel?._id?.toString()}
                channel={JSON.stringify(channel)}
                server={JSON.stringify(server)}
                role={role}
              />
            ))}
          </div>
        )}
        {!!members.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="members"
              role={role}
              server={JSON.stringify(server)}
              label="Members"
            />
            {members.map((member) => (
              <ServerMembers
                key={member?._id?.toString()}
                member={JSON.stringify(member)}
                server={JSON.stringify(server)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ServerSidebar;
