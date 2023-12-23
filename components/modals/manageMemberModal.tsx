"use client";

import { useState } from "react";
import { MemberType, ServerType } from "@/types";
import { onClose, onOpen } from "@/features/modalSlice";
import { useAppDispatch, useAppSelector } from "@/store";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import UserAvatar from "@/components/user-avatar";

import {
  Check,
  Gavel,
  Loader2,
  MoreVertical,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";
import { useRouter } from "next/navigation";

const ManageMemberModal = () => {
  const { isOpen, type, data } = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();
  const [loadingId, setLoadingId] = useState("");
  const router = useRouter();

  const isModalOpen = isOpen && type === "manageMembers";
  let server: ServerType | undefined;
  if (data) server = data.server as ServerType;

  type roleIconType = {
    [role: string]: React.JSX.Element | null;
  };

  const roleIcon: roleIconType = {
    GUEST: null,
    MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
    ADMIN: <ShieldAlert className="h-4 w-4 text-rose-500 ml-2" />,
  };

  const onMemberRemove = async (memberId: string) => {
    try {
      setLoadingId(memberId);
      const url = `/api/member/${memberId}/remove?serverId=${server?._id.toString()}`;
      const res = await fetch(url, { method: "DELETE" });
      const updatedServer = await res.json();

      router.refresh();
      dispatch(
        onOpen({ type: "manageMembers", data: { server: updatedServer } })
      );
    } catch (error: any) {
      console.log("Error while removing the member: ", error.message);
    } finally {
      setLoadingId("");
    }
  };

  const onRoleChange = async (memberId: string, role: string) => {
    try {
      setLoadingId(memberId);
      const url = `/api/member/${memberId}/role?serverId=${server?._id.toString()}&role=${role}`;
      const res = await fetch(url, { method: "PATCH" });
      const memberRoleUpdated = await res.json();

      router.refresh();

      dispatch(
        onOpen({ type: "manageMembers", data: { server: memberRoleUpdated } })
      );
    } catch (error: any) {
      console.log("Error while changing member role: ", error.message);
    } finally {
      setLoadingId("");
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={() => dispatch(onClose())}>
      <DialogContent className="bg-white text-black overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Manage Members
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            {server?.members?.length} Members
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-8 max-h-[420px] pr-6">
          {server?.members?.map((member: MemberType) => (
            <>
              {typeof member.profileId !== "string" && (
                <div
                  key={member._id?.toString()}
                  className="flex items-center gap-x-2 mb-6"
                >
                  <UserAvatar src={member.profileId?.imageUrl} />
                  <div className="flex flex-col gap-y-1">
                    <div
                      className="text-xs font-bold flex items-center cursor-pointer"
                      title={member.role}
                    >
                      {member.profileId?.name}
                      {roleIcon[member.role]}
                    </div>
                    <p className="text-xs text-zinc-500">
                      {member.profileId?.email}
                    </p>
                  </div>
                  {server?.authorId !== member.profileId?._id &&
                    loadingId !== member._id && (
                      <div className="ml-auto">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="cursor-pointer">
                            <MoreVertical className="w-4 h-4 text-zinc-500" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="bottom">
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="flex items-center">
                                <ShieldQuestion className="w-4 h-4 mr-2" />
                                <span>Role</span>
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      member.role !== "GUEST" &&
                                      onRoleChange(
                                        member._id.toString(),
                                        "GUEST"
                                      )
                                    }
                                  >
                                    <Shield className="h-4 w-4 mr-2" />
                                    Guest
                                    {member.role === "GUEST" && (
                                      <Check className="w-4 h-4 ml-auto" />
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      member.role !== "MODERATOR" &&
                                      onRoleChange(
                                        member._id.toString(),
                                        "MODERATOR"
                                      )
                                    }
                                  >
                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                    Moderator
                                    {member.role === "MODERATOR" && (
                                      <Check className="w-4 h-4 ml-auto" />
                                    )}
                                  </DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                onMemberRemove(member._id.toString())
                              }
                            >
                              <Gavel className="h-4 w-4 mr-2" />
                              Kick
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  {loadingId === member._id && (
                    <Loader2 className="animate-spin w-4 h-4 ml-auto text-zinc-500" />
                  )}
                </div>
              )}
            </>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ManageMemberModal;
