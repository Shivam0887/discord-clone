"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MemberType, ProfileType, ReactionType } from "@/types";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Edit, FileIcon, MoreVertical, Trash, VideoIcon } from "lucide-react";

import UserAvatar from "@/components/user-avatar";
import { ActionTooltip } from "@/components/action-tooltip";
import { roleIconMap } from "@/components/server/ServerMembers";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store";
import { onOpen } from "@/features/modalSlice";
import ChatMore from "./ChatMore";
import ChatReactions from "./ChatReactions";

type ChatItemProps = {
  id: string | undefined;
  content: string;
  member: string;
  reactions: ReactionType[];
  type: "channel" | "conversation";
  timestamp: string;
  fileUrl: string | undefined;
  deleted: boolean;
  currentMember: string;
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
};

const formSchema = z.object({
  content: z.string().min(1),
});

const ChatItem = ({
  id,
  content,
  currentMember,
  reactions,
  deleted,
  fileUrl,
  isUpdated,
  member,
  socketQuery,
  socketUrl,
  timestamp,
  type,
}: ChatItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content,
    },
  });

  useEffect(() => {
    form.reset({
      content,
    });
  }, [content, form]);

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (e.key === "Escape" || e.keyCode === 27) {
        setIsEditing(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const otherMember: MemberType = JSON.parse(member);
  const curMember: MemberType = JSON.parse(currentMember);

  const fileType = fileUrl?.split(".").pop();
  const isPDF = fileUrl && fileType === "pdf";
  const isVideo = fileUrl && fileType === "mp4";
  const isImage = fileUrl && !isPDF && !isVideo;
  const isAdmin = curMember.role === "ADMIN";
  const isModerator = curMember.role === "MODERATOR";
  const isSender = curMember._id?.toString() === otherMember._id?.toString();
  const canDeleteMessage = !deleted && (isAdmin || isModerator || isSender);
  const canEditMessage = !deleted && !fileUrl && isSender;

  const isLoading = form.formState.isSubmitting;

  const onMemberClick = () => {
    if (curMember._id === otherMember._id) return;
    router.push(
      `/server/${params?.serverId}/conversations/${otherMember._id.toString()}`
    );
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const qs =
        type === "channel"
          ? `serverId=${socketQuery.serverId}&channelId=${socketQuery.channelId}`
          : `conversationId=${socketQuery.conversationId}`;

      const url = `${socketUrl}/${id}?${qs}`;
      await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      form.reset();
      setIsEditing(false);
    } catch (error: any) {
      console.log("Error while editing the message", error?.message);
    }
  };

  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      <div className="group flex gap-x-2 items-start w-full">
        <div
          className="cursor-pointer hover:drop-shadow-md transtion"
          onClick={onMemberClick}
        >
          <UserAvatar src={(otherMember.profileId as ProfileType)?.imageUrl} />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p
                className="text-sm font-medium hover:underline cursor-pointer text-[#47af94] md:text-base"
                onClick={onMemberClick}
              >
                {(otherMember.profileId as ProfileType)?.name}
              </p>
              <ActionTooltip label={otherMember.role}>
                <p className="ml-2">{roleIconMap[otherMember.role]}</p>
              </ActionTooltip>
            </div>
            <span className="text-xs text-zinc-500 dark:text-[#949ba4]">
              {timestamp}
            </span>
          </div>
          {isImage && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square rounded-md mt-2
                overflow-hidden border flex items-center bg-secondary h-48 w-48"
            >
              <Image
                src={fileUrl}
                alt={content}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 360px, 480px"
              />
            </a>
          )}
          {(isPDF || isVideo) && (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
              {!isVideo ? (
                <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
              ) : (
                <VideoIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
              )}
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
              >
                {isPDF ? "PDF file" : "Video file"}
              </a>
            </div>
          )}
          {!fileUrl && !isEditing && (
            <div>
              <p
                className={cn(
                  "text-sm font-normal text-zinc-600 dark:text-[#dbdee1] md:text-base",
                  deleted && "italic text-xs mt-1 md:text-sm"
                )}
              >
                {content}
                {isUpdated && !deleted && (
                  <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                    (edited)
                  </span>
                )}
              </p>
              <ChatReactions reactions={reactions} />
            </div>
          )}
          {!fileUrl && isEditing && (
            <Form {...form}>
              <form
                className="flex items-center w-full gap-x-2 pt-2"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative w-full">
                          <Input
                            disabled={isLoading}
                            className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0
                            focus-visible:ring-0 focus-visible:ring-offset-0 outline-none text-zinc-600 dark:text-zinc-200"
                            placeholder="Edited message"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button disabled={isLoading} size="sm" variant="primary">
                  Save
                </Button>
              </form>
              <span className="hidden md:inline text-[10px] mt-1 text-zinc-400">
                Press escape to cancel, enter to save
              </span>
            </Form>
          )}
        </div>
      </div>
      {canDeleteMessage && (
        <div
          className="hidden group-hover:flex items-center gap-x-2 absolute
        p-1 -top-2 right-6 bg-white dark:bg-zinc-800 border rounded-sm"
        >
          {canEditMessage && (
            <ActionTooltip label="edit">
              <Edit
                onClick={() => setIsEditing(true)}
                className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>
          )}
          <ActionTooltip label="delete">
            <Trash
              onClick={() =>
                dispatch(
                  onOpen({
                    type: "deleteMessage",
                    data: {
                      apiUrl: `${socketUrl}/${id}`,
                      query: socketQuery,
                      type: type,
                    },
                  })
                )
              }
              className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
        </div>
      )}

      <ChatMore
        messageId={id}
        type={type}
        socketQuery={socketQuery}
        socketUrl={socketUrl}
        content={content}
        name={(otherMember.profileId as ProfileType)?.name}
        memberId={otherMember?._id.toString()}
        imageUrl={(otherMember.profileId as ProfileType)?.imageUrl}
      />
    </div>
  );
};

export default ChatItem;
