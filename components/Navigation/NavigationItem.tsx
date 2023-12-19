"use client";

import Image from "next/image";
import { useRouter, useParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { ActionTooltip } from "@/components/action-tooltip";

interface NavigationItemProps {
  _id: string;
  name: string;
  imageUrl: string;
}

const NavigationItem = ({ _id, name, imageUrl }: NavigationItemProps) => {
  const params = useParams();
  const router = useRouter();

  return (
    <ActionTooltip side="right" align="center" label={name}>
      <button
        onClick={() => router.push(`/server/${_id}`)}
        className="group relative flex items-center"
      >
        <div
          className={cn(
            "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
            params?.serverId === _id
              ? "h-[36px]"
              : "h-[8px] group-hover:h-[20px]"
          )}
        />
        <div
          className={cn(
            "relative group flex m-3 h-[48px] w-[48px] rounded-[24px] overflow-hidden group-hover:rounded-[16px] transition-all",
            params?.serverId === _id &&
              "bg-primary/10 text-primary rounded-[16px]"
          )}
        >
          <Image src={imageUrl} alt="channel" fill priority sizes="(max-width: 768px) 32px, 48px"/>
        </div>
      </button>
    </ActionTooltip>
  );
};
export default NavigationItem;
