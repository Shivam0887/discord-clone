"use client";

import { onOpen } from "@/features/modalSlice";
import { ServerType } from "@/types";
import React from "react";
import { ActionTooltip } from "../action-tooltip";
import { Plus, Settings } from "lucide-react";
import { useAppDispatch } from "@/store";

type ServerSectionProps = {
  label: string;
  role?: string;
  sectionType: "channels" | "members";
  channelType?: string;
  server?: string;
};

const ServerSection = ({
  label,
  role,
  sectionType,
  channelType,
  server,
}: ServerSectionProps) => {
  const dispatch = useAppDispatch();
  const userServer: ServerType = server && JSON.parse(server);

  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-semibold">
        {label}
      </p>
      {role !== "GUEST" && sectionType === "channels" && (
        <ActionTooltip label="Create Channel" side="top">
          <button
            onClick={() =>
              dispatch(onOpen({ type: "createChannel", data: {} }))
            }
            className="text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </ActionTooltip>
      )}
      {role === "ADMIN" && sectionType === "members" && (
        <ActionTooltip label="Manage Members" side="top">
          <button
            onClick={() =>
              dispatch(
                onOpen({ type: "manageMembers", data: { server: userServer } })
              )
            }
            className="text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400 transition"
          >
            <Settings className="w-4 h-4" />
          </button>
        </ActionTooltip>
      )}
    </div>
  );
};

export default ServerSection;
