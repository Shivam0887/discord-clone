import NavigationAction from "./NavigationAction";

import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModeToggle } from "@/components/mode-toggler";

import NavigationItem from "./NavigationItem";
import { ServerType } from "@/types";
import ManageProfile from "@/lib/manageProfile";

const SideNavBar = ({ _servers }: { _servers: any }) => {
  const servers = JSON.parse(_servers);

  return (
    <div className="space-y-4 flex flex-col items-center h-full w-full text-primary bg-[#E3E5E8] dark:bg-[#1e1f22] py-3">
      <NavigationAction />
      <Separator className="h-[2px] bg-zinc-500 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
      <ScrollArea className="flex-1 w-full">
        {servers?.map((server: ServerType) => (
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
        <ManageProfile />
        <ModeToggle />
      </div>
    </div>
  );
};

export default SideNavBar;
