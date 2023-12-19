"use client";

import { cn } from "@/lib/utils";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import UserAvatar from "../user-avatar";

type ServerMembersProps = {
  member: string;
  server: string;
};

export const roleIconMap: { [type: string]: React.ReactNode } = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 mr-2 text-rose-500" />,
};

const ServerMembers = ({ member, server }: ServerMembersProps) => {
  const router = useRouter();
  const params = useParams();

  const userServer = JSON.parse(server);
  const serverMember = JSON.parse(member);

  return (
    <button
      onClick={() =>
        router.push(
          `/server/${
            params?.serverId
          }/conversations/${serverMember?._id.toString()}`
        )
      }
      type="button"
      className={cn(
        "group p-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
        params?.memberId === serverMember._id.toString() &&
          "bg-zinc-700/20 dark:bg-zinc-700"
      )}
    >
      <UserAvatar
        src={serverMember?.profileId?.imageUrl}
        className="h-6 w-6 md:h-8 md:w-8"
      />
      <p
        className={cn(
          "font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
          params?.memberId === serverMember?._id?.toString() &&
            "text-primary dark:text-zinc-200 dark:group-hover:text-white"
        )}
      >
        {serverMember?.profileId?.name}
      </p>
      {roleIconMap[serverMember.role]}
    </button>
  );
};

export default ServerMembers;
