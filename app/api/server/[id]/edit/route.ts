import { connectToDB } from "@/lib/dbConnection";
import { Server } from "@/lib/modals/modals";
import { userProfile } from "@/lib/userProfile";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const url = req.nextUrl.clone();
  url.pathname = "/";
  if (!params.id) return NextResponse.redirect(url);

  try {
    const profile = await userProfile();
    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    connectToDB();
    const server = await req.json();

    const updatedServer = await Server.findByIdAndUpdate(params.id, {
      $set: {
        name: server?.serverName,
        imageUrl: server?.imageUrl,
      },
    });

    return new NextResponse("Server updated successfully", { status: 200 });
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 });
  }
}
