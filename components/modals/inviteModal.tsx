"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { onClose, onOpen } from "@/features/modalSlice";
import { useAppDispatch, useAppSelector } from "@/store";
import { Check, Copy, RefreshCw } from "lucide-react";

import { useOrigin } from "@/hooks/useOrigin";
import { useState } from "react";
import { ServerType } from "@/types";

const InviteModal = () => {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { isOpen, type, data } = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();
  const origin = useOrigin();

  const isModalOpen = isOpen && type === "invite";
  let server: ServerType | undefined;
  if (data) server = data.server as ServerType;

  const inviteUrl = `${origin}/invite/${server?.inviteCode}`;

  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const newInviteCode = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/server/${server?._id}/invite-code`, {
        method: "PATCH",
      });
      const updatedServer = await res.json();
      dispatch(onOpen({ type: "invite", data: { server: updatedServer } }));
    } catch (error: any) {
      console.log("Error while generating invite code", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={() => dispatch(onClose())}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Invite Friends
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <Label className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
            Server invite link
          </Label>
          <div className="flex items-center mt-2 gap-x-2">
            <Input
              readOnly
              disabled={isLoading}
              className="bg-zinc-300/50 border-0 text-black
                focus-visible:ring-0 focus-visible:ring-offset-0"
              value={inviteUrl}
            />
            <Button disabled={isLoading} size="icon" onClick={onCopy}>
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          <Button
            onClick={newInviteCode}
            disabled={isLoading}
            variant="link"
            size="sm"
            className="text-xs text-zinc-500 mt-4"
          >
            Generate a new link
            <RefreshCw className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteModal;
