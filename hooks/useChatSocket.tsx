"use client";

import { useSocket } from "@/components/providers/socket-provider";
import { MessageType } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
};

const useChatSocket = ({ addKey, queryKey, updateKey }: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    socket.on(updateKey, (message: any) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return oldData;
        }

        const newData = oldData.pages.map((page: any) => {
          return {
            nextCursor: page?.nextCursor,
            data: page.data.map((item: any) => {
              if (item._id === message._id) {
                return message;
              }
              return item;
            }),
          };
        });

        return {
          pageParams: oldData?.pageParams,
          pages: newData,
        };
      });
    });

    socket.on(addKey, (message: any) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            ...oldData,
            pages: [
              {
                data: [message],
              },
            ],
          };
        }

        const newData = [...oldData.pages];

        newData[0] = {
          data: [message, ...newData[0].data],
        };

        return {
          ...oldData,
          pages: newData,
        };
      });
    });

    return () => {
      socket.off(addKey);
      socket.off(updateKey);
    };
  }, [socket, addKey, updateKey, queryKey, queryClient]);
};

export default useChatSocket;
