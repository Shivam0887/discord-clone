import { connectToDB } from "@/lib/dbConnection";
import { Server } from "@/lib/modals/modals";
import { NextResponse } from "next/server";
import cypto from "crypto";
import { userProfile } from "@/lib/userProfile";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const profile = await userProfile();

  if (!profile) return new NextResponse("Unauthorized", { status: 401 });
  if (!params.id) return new NextResponse("Server ID Missing", { status: 400 });

  try {
    connectToDB();
    const serverWithNewCode = await Server.findByIdAndUpdate(params.id, {
      $set: { inviteCode: cypto.randomUUID() },
    });

    return NextResponse.json(serverWithNewCode, { status: 200 });
  } catch (error: any) {
    console.log(
      "Error while fetch server details when generating new invite code",
      error.message
    );
    return new NextResponse("Internal error", { status: 500 });
  }
}
