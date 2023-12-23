"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Smile } from "lucide-react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type EmojiPickerProps = {
  onChange: (value: string) => void;
  type: "input" | "addMore";
  onSelect?: boolean;
};

const EmojiPicker = ({ onChange, type }: EmojiPickerProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return;

  return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
        {type === "input" ? (
          <Smile className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
        ) : (
          <Plus
            className="font-bold w-[18px] h-[18px] md:w-6 md:h-6 p-1 text-zinc-300
            hover:bg-zinc-600 bg-zinc-500 dark:text-zinc-700 dark:bg-zinc-400
            dark:hover:bg-zinc-300 rounded-full cursor-pointer transition"
          />
        )}
      </PopoverTrigger>
      <PopoverContent
        side={window.innerWidth <= 450 ? "top" : "right"}
        sideOffset={40}
        className="bg-transparent border-none shadow-none drop-shadow-none mb-16"
      >
        <Picker
          theme={resolvedTheme}
          data={data}
          onEmojiSelect={(emoji: any) => onChange(emoji.native)}
          perLine={window.innerWidth <= 450 ? 6 : 9}
        />
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
