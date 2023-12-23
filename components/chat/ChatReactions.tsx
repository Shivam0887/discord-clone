"use client";

import { ReactionType } from "@/types";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { roleIconMap } from "../server/ServerMembers";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ActionTooltip } from "../action-tooltip";

const ChatReactions = ({ reactions }: { reactions: ReactionType[] }) => {
  const params = useParams();
  return (
    <>
      {reactions?.length > 0 && (
        <Dialog>
          <DialogTrigger
            asChild
            className="bg-zinc-100 group-hover:bg-zinc-200 group-hover:dark:bg-zinc-800 dark:bg-zinc-800/50 mt-2 rounded-sm p-1 py-0 transition"
          >
            <button>
              {reactions.slice(0, 5).map((reaction) => (
                <span
                  key={reaction.emoji}
                  className="relative m-2 md:m-0 text-sm"
                >
                  {reaction.emoji}
                  <span className="absolute left-[14px] -bottom-[6px] text-[10px] font-semibold ">
                    {reaction.users.length}
                  </span>
                </span>
              ))}
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-fit">
            <Tabs defaultValue={reactions[0].emoji}>
              <TabsList>
                {reactions.map((reaction) => (
                  <TabsTrigger key={reaction.emoji} value={reaction.emoji}>
                    <p className="text-base">{reaction.emoji}</p>
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="mt-4">
                {reactions.map((reaction) => (
                  <TabsContent key={reaction.emoji} value={reaction.emoji}>
                    <ScrollArea>
                      <div className="flex flex-col gap-4">
                        {reaction.users.map((user) => (
                          <Link
                            key={user.memberId}
                            href={`/server/${params?.serverId}/conversations/${user.memberId}`}
                            className="flex gap-x-2 items-center"
                          >
                            <Image
                              src={user.imageUrl}
                              alt={user.name}
                              width={28}
                              height={28}
                              className="object-cover rounded-full"
                            />
                            <p className="text-sm hover:underline cursor-pointer">
                              {user.name}
                            </p>
                            <ActionTooltip label={user.role} side="right">
                              {roleIconMap[user.role]}
                            </ActionTooltip>
                          </Link>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ChatReactions;
