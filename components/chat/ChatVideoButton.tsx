"use client";

import qs from "qs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Video, VideoOff } from "lucide-react";
import { ActionTooltip } from "../action-tooltip";

const ChatVideoButton = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isVideo = searchParams?.get("video");

  const Icon = isVideo ? VideoOff : Video;
  const toolTipLabel = isVideo ? "End video call" : "Start video call";

  const onClick = () => {
    const url = qs.stringify(
      {
        url: pathname || "",
        query: {
          video: isVideo ? undefined : true,
        },
      },
      { skipNulls: true }
    );

    router.push(url);
  };

  return (
    <ActionTooltip label={toolTipLabel} side="bottom">
      <button onClick={onClick} className="hover:opacity-75 transition mr-4">
        <Icon className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
      </button>
    </ActionTooltip>
  );
};

export default ChatVideoButton;
