"use client";

import { Menu } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import SideNavBar from "@/components/Navigation/SideNavBar";
import ServerSidebar from "@/components/server/ServerSidebar";

const getServerAndProfile = async ({ queryKey }: { queryKey: any }) => {
  const res = await fetch(`/api/server?serverId=${queryKey[1]}`);
  return res.json();
};

const getServers = async () => {
  const res = await fetch("/api/servers");
  return res.json();
};

const SidebarToggle = ({ serverId }: { serverId: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["server", serverId],
    queryFn: getServerAndProfile,
  });

  const { data: res, isLoading: isServersLoading } = useQuery({
    queryKey: ["servers"],
    queryFn: getServers,
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 flex gap-0">
        <div className="w-[72px]">
          {!isServersLoading && (
            <SideNavBar _servers={JSON.stringify(res?.servers)} />
          )}
        </div>
        {!isLoading && (
          <ServerSidebar
            _server={JSON.stringify(data?.server)}
            profileId={data?.profile?._id?.toString()}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};

export default SidebarToggle;
