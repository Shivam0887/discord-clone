import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import ChatMessages from "@/components/chat/ChatMessages";
import { MediaRoom } from "@/components/media-room";
import { connectToDB } from "@/lib/dbConnection";
import { Channel, Member, Profile } from "@/lib/modals/modals";
import { userProfile } from "@/lib/userProfile";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

type ChannelPageProps = {
  params: {
    serverId: string;
    channelId: string;
  };
};

const ChannelPage = async ({ params }: ChannelPageProps) => {
  const profile = await userProfile();
  if (!profile?._id) return redirectToSignIn();

  connectToDB();
  const channel = await Channel.findOne({
    _id: params.channelId,
    serverId: params?.serverId,
  });
  const member = await Member.findOne({
    profileId: profile?._id,
    serverId: params?.serverId,
  }).populate({
    path: "profileId",
    model: Profile,
    select: "_id name imageUrl",
  });

  if (!channel?._id || !member?._id) return redirect("/");

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-screen">
      <ChatHeader
        serverId={params?.serverId}
        name={channel?.name}
        type="channel"
      />

      {channel?.type === "TEXT" && (
        <>
          <ChatMessages
            member={JSON.stringify(member)}
            name={channel?.name}
            chatId={channel?._id?.toString()}
            type="channel"
            apiUrl="/api/messages"
            socketUrl="/api/socket/messages"
            socketQuery={{
              channelId: channel?._id?.toString(),
              serverId: channel?.serverId?.toString(),
            }}
            paramKey="channelId"
            paramValue={channel?._id?.toString()}
          />
          <ChatInput
            name={channel?.name}
            type="channel"
            apiUrl="/api/socket/messages"
            query={{
              channelId: channel?._id?.toString(),
              serverId: channel?.serverId?.toString(),
            }}
          />
        </>
      )}
      {channel?.type === "AUDIO" && (
        <MediaRoom
          chatId={channel?._id?.toString()}
          video={false}
          audio={true}
        />
      )}
      {channel?.type === "VIDEO" && (
        <MediaRoom
          chatId={channel?._id?.toString()}
          video={true}
          audio={false}
        />
      )}
    </div>
  );
};

export default ChannelPage;
