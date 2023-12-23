"use client";

import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Copy, MoreVertical, Reply } from "lucide-react";
import { ActionTooltip } from "../action-tooltip";
import EmojiPicker from "../emoji-picker";
import { useAppDispatch } from "@/store";
import { onOpen } from "@/features/modalSlice";
import { useParams } from "next/navigation";
import { useState } from "react";

type ChatMoreProps = {
  messageId: string;
  type: "channel" | "conversation";
  socketUrl: string;
  socketQuery: Record<string, string>;
  content: string;
  name: string;
  memberId: string;
  imageUrl: string;
};

const ChatMore = ({
  messageId,
  type,
  socketUrl,
  socketQuery,
  content,
  memberId,
  name,
  imageUrl,
}: ChatMoreProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const dispatch = useAppDispatch();
  const params = useParams();

  const handleClick = () => {
    setIsCopied(true);
    navigator.clipboard
      .writeText(content)
      .then(() => {
        console.log("Text copied to clipboard");
      })
      .catch((err) => {
        console.error("Unable to copy text: ", err);
      });
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleEmojiClick = async (emoji: any) => {
    const url =
      type === "channel"
        ? `${socketUrl}/reactions/${messageId}?serverId=${socketQuery.serverId}&channelId=${socketQuery.channelId}`
        : `${socketUrl}/reactions/${messageId}?conversationId=${socketQuery.conversationId}`;

    await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ emoji }),
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <ActionTooltip label="more" side="left">
          <MoreVertical className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
        </ActionTooltip>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-1 cursor-pointer">
            <p>Add a reaction</p>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent
              sideOffset={5}
              className="min-w-0 flex flex-col gap-1 items-center"
            >
              <DropdownMenuItem>
                <button
                  className="text-lg md:text-xl cursor-pointer"
                  onClick={(e: any) => handleEmojiClick(e.target?.textContent)}
                >
                  👍
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <button
                  className="text-lg md:text-xl cursor-pointer"
                  onClick={(e: any) => handleEmojiClick(e.target?.textContent)}
                >
                  👌
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <button
                  className="text-lg md:text-xl cursor-pointer"
                  onClick={(e: any) => handleEmojiClick(e.target?.textContent)}
                >
                  ❤️
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <button
                  className="text-lg md:text-2xl cursor-pointer"
                  onClick={(e: any) => handleEmojiClick(e.target?.textContent)}
                >
                  😂
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <button
                  className="text-lg md:text-2xl cursor-pointer"
                  onClick={(e: any) => handleEmojiClick(e.target?.textContent)}
                >
                  😘
                </button>
              </DropdownMenuItem>
              <div className="bg-zinc-600 w-8 h-[2px] rounded-lg dark:bg-zinc-500" />
              <DropdownMenuItem
                onSelect={(e: Event) => {
                  e.preventDefault();
                }}
              >
                <EmojiPicker
                  type="addMore"
                  onChange={(emoji: string) => {
                    handleEmojiClick(emoji);
                  }}
                />
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <div className="flex justify-between w-full cursor-pointer">
              <button
                onClick={() =>
                  dispatch(
                    onOpen({
                      type: "replyMessage",
                      data: {
                        server: params?.serverId as string,
                        type: type,
                        message: {
                          id: messageId,
                          name,
                          content,
                          memberId,
                          imageUrl: imageUrl,
                        },
                      },
                    })
                  )
                }
              >
                reply
              </button>
              <Reply className="ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={(e: Event) => e.preventDefault()}>
            <div
              className="flex justify-between w-full cursor-pointer"
              onClick={handleClick}
            >
              <p>copy</p>
              {!isCopied ? (
                <Copy className="ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
              ) : (
                <Check className="ml-auto w-4 h-4 stroke-emerald-600 transition" />
              )}
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChatMore;
