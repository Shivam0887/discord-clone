"use client";

import { cn } from "@/lib/utils";
import { ChannelType, ServerType } from "@/types";
import { Edit, Hash, Lock, Mic, Trash, Video } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { ActionTooltip } from "../action-tooltip";
import { onOpen } from "@/features/modalSlice";
import { useAppDispatch } from "@/store";

type ServerChannelsProps = {
  channel: string;
  server: string;
  role?: string;
};

const iconMap: { [type: string]: React.JSX.Element } = {
  TEXT: (
    <Hash className="flex-shrink-0 h-5 w-5 text-zinc-500 dark:text-zinc-400" />
  ),
  AUDIO: (
    <Mic className="flex-shrink-0 h-5 w-5 text-zinc-500 dark:text-zinc-400" />
  ),
  VIDEO: (
    <Video className="flex-shrink-0 h-5 w-5 text-zinc-500 dark:text-zinc-400" />
  ),
};

const ServerChannels = ({
  channel = "",
  server,
  role,
}: ServerChannelsProps) => {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();

  const _channel: ChannelType = JSON.parse(channel);
  const _server: ServerType = JSON.parse(server);

  const handleClick = () => {
    try {
      dispatch(
        onOpen({
          type: "editChannel",
          data: { server: _server, channel: _channel },
        })
      );
    } catch (error: any) {
      console.log("Error while editing the channel", error.message);
    }
  };

  return (
    <button
      onClick={() =>
        router.push(
          `/server/${params?.serverId}/channels/${_channel?._id.toString()}`
        )
      }
      className={cn(
        "group p-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
        params?.channelId === _channel?._id.toString() &&
          "bg-zinc-700/20 dark:bg-zinc-700"
      )}
    >
      {iconMap[_channel.type]}
      <p
        className={cn(
          "line-clamp-1 font-semibold text-sm text-zinc-500 group-hove:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
          params?.channelId === _channel?._id.toString() &&
            "text-primary dark:text-zinc-200 dark:group-hover:text-white"
        )}
      >
        {_channel.name}
      </p>
      {_channel.name !== "general" && role !== "GUEST" && (
        <div className="ml-auto flex items-center gap-x-2">
          <ActionTooltip label="Edit">
            <Edit
              onClick={handleClick}
              className="w-4 h-4 hidden group-hover:block text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
          <ActionTooltip label="Delete">
            <Trash
              onClick={() =>
                dispatch(
                  onOpen({
                    type: "deleteChannel",
                    data: { server: _server, channel: _channel },
                  })
                )
              }
              className="w-4 h-4 hidden group-hover:block text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
        </div>
      )}
      {_channel.name === "general" && (
        <Lock className="w-4 h-4 ml-auto text-zinc-500 dark:text-zinc-400" />
      )}
    </button>
  );
};

export default ServerChannels;
