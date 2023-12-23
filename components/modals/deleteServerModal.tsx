"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { onClose } from "@/features/modalSlice";
import { useAppDispatch, useAppSelector } from "@/store";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ServerType } from "@/types";

const DeleteServerModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isOpen, type, data } = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();

  const isModalOpen = isOpen && type === "deleteServer";

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await fetch(
        `/api/server?serverId=${(data?.server as ServerType)?._id.toString()}`,
        {
          method: "DELETE",
        }
      );

      dispatch(onClose());
      router.refresh();
      router.push("/");
    } catch (error) {
      if (error instanceof Error)
        console.log("Error while deleting the server", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={() => dispatch(onClose())}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Delete Server
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to do this? <br />
            <span className="font-semibold text-indigo-500">
              {(data?.server as ServerType)?.name}
            </span>{" "}
            will be permanently deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-gray-100 px-5 py-4">
          <div className="flex items-center justify-around w-full">
            <Button
              variant="ghost"
              disabled={isLoading}
              onClick={() => dispatch(onClose())}
            >
              Cancel
            </Button>
            <Button variant="primary" disabled={isLoading} onClick={onDelete}>
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteServerModal;
