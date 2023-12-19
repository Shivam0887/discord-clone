import { NextApiRequest } from "next";
import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { NextApiResponseWithServerIO } from "@/types";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function ioHandle(
  req: NextApiRequest,
  res: NextApiResponseWithServerIO
) {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any;
    const io = new SocketIOServer(httpServer, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      connectionStateRecovery: {},
    });

    res.socket.server.io = io;
  }

  res.end();
}
