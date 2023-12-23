"use client";

import { ReplyType } from "@/types";
import Image from "next/image";
import Link from "next/link";

const ChatReply = ({
  reply,
  memberId,
}: {
  reply: ReplyType;
  memberId: string;
}) => {
  return (
    <div className="relative mt-2">
      <div className="absolute flex gap-2 items-center left-7 md:left-9 -bottom-3">
        <div className="w-10 h-3 border-[2.5px] border-zinc-600 rounded-ss-lg border-b-0 border-r-0" />
        <Image
          src={reply?.imageUrl}
          alt={reply?.name}
          width={18}
          height={18}
          className="rounded-full"
        />
        {memberId !== reply?.memberId_repliedTo && (
          <Link
            href={`/server/${reply?.serverId}/conversations/${reply?.memberId_repliedTo}`}
            className="text-[#3f8273] text-sm"
          >
            @{reply?.name}
          </Link>
        )}
        <p className="text-sm text-[#dbdee1]">{reply?.content}</p>
      </div>
    </div>
  );
};

export default ChatReply;
