"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

import { Plus } from "lucide-react";
import { useAppDispatch } from "@/store";
import { onOpen } from "@/features/modalSlice";
import EmojiPicker from "../emoji-picker";
import { useRouter } from "next/navigation";

type ChatInputProps = {
  apiUrl: string;
  query: Record<string, string>;
  name: string;
  type: "conversation" | "channel";
};

const formSchema = z.object({
  content: z.string().min(1),
});

const ChatInput = ({ apiUrl, query, name, type }: ChatInputProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const router = useRouter();
  const dispatch = useAppDispatch();
  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const qs =
        type === "channel"
          ? `serverId=${query.serverId}&channelId=${query.channelId}`
          : `conversationId=${query.conversationId}`;

      await fetch(`${apiUrl}?${qs}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      form.reset();
      router.refresh();
    } catch (error: any) {
      console.log(`Error while sending messages from channel`, error.message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative p-4 pb-6">
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(
                        onOpen({ type: "messageFile", data: { apiUrl, query } })
                      )
                    }
                    className="absolute top-7 left-8 h-[24px] w-[24px]
                   bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600
                   dark:hover:bg-zinc-300 transition rounded-full p-1
                   flex items-center justify-center"
                  >
                    <Plus className="text-white dark:text-[#313338]" />
                  </button>
                  <input
                    id="msg-input"
                    disabled={isSubmitting}
                    placeholder={`Message ${
                      type === "conversation" ? name : "#" + name
                    }`}
                    {...field}
                    className="w-full px-14 py-3 bg-zinc-200/90
                   dark:bg-zinc-700/75 border-none border-0 outline-none focus-visible:ring-0
                   focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                  />
                  <div className="absolute top-7 right-8">
                    <EmojiPicker
                      onChange={(emoji: string) => {
                        const input = document.getElementById(
                          "msg-input"
                        ) as HTMLInputElement;

                        let index = input.selectionStart!;
                        let msg =
                          field.value.slice(0, index) +
                          emoji +
                          field.value.slice(index);
                        field.onChange(msg);
                      }}
                    />
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default ChatInput;
