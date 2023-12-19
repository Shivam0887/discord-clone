import { connectToDB } from "@/lib/dbConnection";
import { Profile, Server } from "@/lib/modals/modals";
import { userProfile } from "@/lib/userProfile";
import { ServerType } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const profile = await userProfile();

  if (!profile?._id) return NextResponse.redirect(new URL("/sign-in", req.url));

  type serverType = Pick<ServerType, "_id" | "name" | "imageUrl">;
  let servers: serverType[] = [];

  try {
    connectToDB();
    const res = await Profile.findById(profile?._id, {
      _id: 0,
      server: 1,
    }).populate({
      path: "server",
      model: Server,
      select: "_id name imageUrl",
    });
    servers = res?.server;

    return NextResponse.json({ servers }, { status: 200 });
  } catch (error: any) {
    console.log("Failed to fetch servers ", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
