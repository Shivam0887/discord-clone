"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useSocket } from "@/components/providers/socket-provider";

type ChatQueryProps = {
  queryKey: string;
  apiUrl: string;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
};

export const useChatQuery = ({
  queryKey,
  apiUrl,
  paramKey,
  paramValue,
}: ChatQueryProps) => {
  const { isConnected } = useSocket();

  const fetchMessages = async ({ pageParam }: { pageParam: string }) => {
    const cursor = pageParam ? `cursor=${pageParam}` : "";
    const page = paramValue ? `${paramKey}=${paramValue}` : "";

    let url = apiUrl;
    if (cursor && !page) url += `?${cursor}`;
    else if (page && !cursor) url += `?${page}`;
    else if (cursor && page) url += `?${cursor}&${page}`;

    const res = await fetch(url);
    return res.json();
  };

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, status } =
    useInfiniteQuery({
      queryKey: [queryKey],
      queryFn: fetchMessages,
      initialPageParam: "",
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
      refetchInterval: isConnected ? false : 1000,
    });

  return {
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    status,
  };
};
