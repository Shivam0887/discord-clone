"use client";

import { Plus } from "lucide-react";
import { ActionTooltip } from "@/components/action-tooltip";

import { onOpen } from "@/features/modalSlice";
import { useAppDispatch } from "@/store";

const NavigationAction = () => {
  const dispatch = useAppDispatch();
  return (
    <>
      <ActionTooltip side="right" align="center" label="Add a Server">
        <button
          type="button"
          className="group flex items-center"
          onClick={() => dispatch(onOpen({ type: "createServer", data: {} }))}
        >
          <div
            className="flex justify-center items-center mx-3 h-[48px] w-[48px] bg-background dark:bg-neutral-700
              rounded-[24px] overflow-hidden group-hover:rounded-[16px] group-hover:bg-emerald-500 transition-all"
          >
            <Plus
              className="group-hover:text-white text-emerald-500 transition-[color]"
              size={20}
            />
          </div>
        </button>
      </ActionTooltip>
    </>
  );
};

export default NavigationAction;
