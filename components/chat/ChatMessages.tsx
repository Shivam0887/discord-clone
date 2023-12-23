"use client";

import { MemberType, MessageType } from "@/types";
import ChatWelcome from "./ChatWelcome";
import { useChatQuery } from "@/hooks/useChatQuery";
import { Loader2, ServerCrash } from "lucide-react";
import { Fragment, useRef, ElementRef } from "react";
import ChatItem from "./ChatItem";
import { format } from "date-fns";
import useChatSocket from "@/hooks/useChatSocket";
import useChatScroll from "@/hooks/useChatScroll";
import ChatReply from "./ChatReply";

const DATE_FORMAT = "d MMM yyyy, HH:mm";

type ChatMessagesProps = {
  name: string;
  member: string;
  chatId: string;
  apiUrl: string;
  socketUrl: string;
  socketQuery: Record<string, string>;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
  type: "channel" | "conversation";
};

const ChatMessages = ({
  name,
  member,
  chatId,
  apiUrl,
  socketUrl,
  socketQuery,
  paramKey,
  paramValue,
  type,
}: ChatMessagesProps) => {
  const queryKey = `chat:${chatId}`;
  const addKey = `chat:${chatId}:messages`;
  const updateKey = `chat:${chatId}:messages:update`;

  const chatRef = useRef<ElementRef<"div">>(null);
  const bottomRef = useRef<ElementRef<"div">>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({
      queryKey,
      apiUrl,
      paramKey,
      paramValue,
    });

  useChatSocket({ queryKey, addKey, updateKey });
  useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
    count: data?.pages?.[0]?.data?.length ?? 0,
  });

  return (
    <div ref={chatRef} className="flex flex-col flex-1 py-4 overflow-y-auto">
      {!hasNextPage && <div className="flex-1" />}
      {!hasNextPage && <ChatWelcome type={type} name={name} />}
      {hasNextPage && (
        <div className="flex justify-center">
          {isFetchingNextPage ? (
            <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4" />
          ) : (
            <button
              onClick={() => fetchNextPage()}
              className="text-zinc-500 hover:text-zinc-500 dark:text-zinc-400 text-xs my-4 dark:hover:text-zinc-300 transition"
            >
              Load previous messages
            </button>
          )}
        </div>
      )}
      {status === "pending" && (
        <div className="flex flex-1 flex-col justify-center items-center">
          <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Loading messages...
          </p>
        </div>
      )}
      {status === "error" && (
        <div className="flex flex-1 flex-col justify-center items-center">
          <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Something went wrong!
          </p>
        </div>
      )}
      <div className="flex flex-col-reverse mt-auto">
        {data?.pages?.map((group, i) => (
          <Fragment key={i}>
            {group?.data.map((message: MessageType) => (
              <Fragment key={message._id?.toString()}>
                <ChatItem
                  id={message?._id?.toString()}
                  reactions={message.reactions}
                  type={type}
                  member={JSON.stringify(message.memberId)}
                  currentMember={member}
                  content={message.content}
                  fileUrl={message.fileUrl}
                  deleted={message.isDeleted}
                  timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
                  isUpdated={message.createdAt !== message.updatedAt}
                  socketUrl={socketUrl}
                  socketQuery={socketQuery}
                />
                {message.isReply && (
                  <ChatReply
                    reply={message.reply}
                    memberId={(message.memberId as MemberType)._id.toString()}
                  />
                )}
              </Fragment>
            ))}
          </Fragment>
        ))}
      </div>
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;
