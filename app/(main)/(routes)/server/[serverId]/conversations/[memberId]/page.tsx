import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import ChatMessages from "@/components/chat/ChatMessages";
import { MediaRoom } from "@/components/media-room";
import { getOrCreateConversation } from "@/lib/conversation";
import { connectToDB } from "@/lib/dbConnection";
import { Member } from "@/lib/modals/modals";
import { userProfile } from "@/lib/userProfile";
import { redirectToSignIn } from "@clerk/nextjs";
import { Types } from "mongoose";
import { redirect } from "next/navigation";

type MemberIdProps = {
  params: {
    memberId: string;
    serverId: string;
  };
  searchParams: {
    video?: boolean;
  };
};

const ConversationPage = async ({ params, searchParams }: MemberIdProps) => {
  const profile = await userProfile();
  if (!profile?._id) return redirectToSignIn();

  connectToDB();
  const currentMember = await Member.aggregate([
    {
      $match: {
        profileId: profile?._id,
        serverId: new Types.ObjectId(params?.serverId),
      },
    },
    {
      $lookup: {
        from: "profiles",
        localField: "profileId",
        foreignField: "_id",
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
  ]).then((res) => res?.[0]);

  if (!currentMember?._id) return redirect("/");

  const conversation = await getOrCreateConversation(
    currentMember?._id?.toString(),
    params?.memberId
  );

  if (!conversation) return redirect(`/server/${params?.serverId}`);

  const { conversationId, memberOne, memberTwo } = conversation;

  const otherMember =
    String(memberOne?.profileId?._id) === String(profile?._id)
      ? memberTwo
      : memberOne;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-screen">
      <ChatHeader
        serverId={params?.serverId}
        name={otherMember?.profileId?.name}
        type="conversation"
        imageUrl={otherMember?.profileId?.imageUrl}
      />
      {!searchParams.video && (
        <>
          <ChatMessages
            member={JSON.stringify(currentMember)}
            name={otherMember?.profileId?.name}
            chatId={conversationId}
            type="conversation"
            apiUrl="/api/direct-messages"
            paramKey="conversationId"
            paramValue={conversationId}
            socketUrl="/api/socket/direct-messages"
            socketQuery={{ conversationId }}
          />
          <ChatInput
            name={otherMember?.profileId?.name}
            type="conversation"
            apiUrl="/api/socket/direct-messages"
            query={{ conversationId }}
          />
        </>
      )}
      {searchParams.video && (
        <MediaRoom chatId={conversationId} video={true} audio={true} />
      )}
    </div>
  );
};

export default ConversationPage;
