"use client";

import { ServerType } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  LogOut,
  PlusCircle,
  Settings,
  Trash,
  UserPlus,
  Users,
} from "lucide-react";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import { useAppDispatch } from "@/store";
import { onOpen } from "@/features/modalSlice";

type ServerHeaderProps = {
  server: string;
  role?: string;
};

const ServerHeader = ({ server, role }: ServerHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();

  const userServer: ServerType = JSON.parse(server);

  const isAdmin = role === "ADMIN";
  const isModerator = isAdmin || role === "MODERATOR";

  return (
    <DropdownMenu open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DropdownMenuTrigger
        className="focus:outline-none"
        asChild
        id="dropdownMenuTrigger"
      >
        <button
          type="button"
          className="flex items-center w-full h-12 text-base font-semibold 
        px-2 dark:border-neutral-800 border-neutral-200 border-b-2 
        dark:hover:bg-zinc-700/50 hover:bg-zinc-700/10 transition"
        >
          {userServer.name}
          <ChevronDown
            className={`h-5 w-5 ml-auto ${isOpen ? "-rotate-180" : "rotate-0"}`}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 text-xs font-medium text-black dark:text-neutral-400 space-y-[2px]">
        {isModerator && (
          <DropdownMenuItem
            className="text-indigo-600 px-3 py-2 text-sm cursor-pointer dark:text-indigo-400"
            onClick={() =>
              dispatch(onOpen({ type: "invite", data: { server: userServer } }))
            }
          >
            Invite People
            <UserPlus className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}

        {isAdmin && (
          <DropdownMenuItem
            className="px-3 py-2 text-sm cursor-pointer"
            onClick={() =>
              dispatch(
                onOpen({ type: "editServer", data: { server: userServer } })
              )
            }
          >
            Server Settings
            <Settings className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}

        {isAdmin && (
          <DropdownMenuItem
            className="px-3 py-2 text-sm cursor-pointer"
            onClick={() =>
              dispatch(
                onOpen({ type: "manageMembers", data: { server: userServer } })
              )
            }
          >
            Manage Members
            <Users className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}

        {isModerator && (
          <DropdownMenuItem
            onClick={() =>
              dispatch(onOpen({ type: "createChannel", data: {} }))
            }
            className="px-3 py-2 text-sm cursor-pointer"
          >
            Create Channel
            <PlusCircle className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}

        {isModerator && <DropdownMenuSeparator />}

        {isAdmin && (
          <DropdownMenuItem
            onClick={() =>
              dispatch(
                onOpen({ type: "deleteServer", data: { server: userServer } })
              )
            }
            className="text-rose-500 px-3 py-2 text-sm cursor-pointer"
          >
            Delete Server
            <Trash className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}

        {!isAdmin && (
          <DropdownMenuItem
            onClick={() =>
              dispatch(
                onOpen({ type: "leaveServer", data: { server: userServer } })
              )
            }
            className="text-rose-500 px-3 py-2 text-sm cursor-pointer"
          >
            Leave Server
            <LogOut className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ServerHeader;
