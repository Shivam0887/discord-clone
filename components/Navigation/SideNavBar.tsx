import { userProfile } from "@/lib/userProfile";
import { connectToDB } from "@/lib/dbConnection";
import { Server } from "@/lib/modals/modals";

import { redirect } from "next/navigation";
import NavigationAction from "./NavigationAction";

import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModeToggle } from "@/components/mode-toggler";

import NavigationItem from "./NavigationItem";
import { UserButton } from "@clerk/nextjs";
import React from "react";
import { ServerType } from "@/types";

const SideNavBar = async () => {
  const profile = await userProfile();

  if (!profile) return redirect("/");

  type serverType = Pick<ServerType, "_id" | "name" | "imageUrl">;
  let servers: serverType[] = [];

  try {
    connectToDB();
    servers = await Server.aggregate([
      {
        $unwind: "$members",
      },
      {
        $lookup: {
          from: "members",
          foreignField: "_id",
          localField: "members",
          as: "members",
        },
      },
      {
        $match: {
          "members.profileId": profile._id,
        },
      },
      {
        $project: { name: 1, imageUrl: 1 },
      },
    ]);
  } catch (error: any) {
    console.log("Failed to fetch servers ", error.message);
  }

  return (
    <div className="space-y-4 flex flex-col items-center h-full w-full text-primary bg-[#f5f5f5] dark:bg-[#1e1f22] py-3">
      <NavigationAction />
      <Separator className="h-[2px] bg-zinc-500 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
      <ScrollArea className="flex-1 w-full">
        {servers.map((server: serverType) => (
          <span key={server._id} className="mb-4">
            <NavigationItem
              _id={server._id.toString()}
              name={server.name}
              imageUrl={server.imageUrl}
            />
          </span>
        ))}
      </ScrollArea>

      <div className="pb-3 mt-auto flex flex-col items-center gap-y-4">
        {/* <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-[35px] w-[35px]",
            },
          }}
        /> */}
        <ModeToggle />
      </div>
    </div>
  );
};

export default SideNavBar;
