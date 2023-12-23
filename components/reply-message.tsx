"use client";

import { onClose } from "@/features/modalSlice";
import { useAppDispatch, useAppSelector } from "@/store";
import { PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ReplyMessage = () => {
  const { isOpen, type, data } = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();

  const isModalOpen = isOpen && type === "replyMessage";

  return (
    <div
      className={cn(
        "hidden dark:bg-[#2b2d31] mx-4 h-8 justify-between px-4 py-2 rounded-t-md items-center transition",
        `${isModalOpen && "flex"}`
      )}
    >
      <p className="text-[13px] font-thin">
        Replying to{" "}
        <span className="text-[#47af94] font-semibold">
          {data?.message?.name || "John"}
        </span>
      </p>
      <button>
        <PlusCircle
          className="w-5 h-5 rotate-45 stroke-[#2b2d31] fill-zinc-400"
          onClick={() => dispatch(onClose())}
        />
      </button>
    </div>
  );
};

export default ReplyMessage;
