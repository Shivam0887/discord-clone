import ServerSidebar from "@/components/server/ServerSidebar";
import { connectToDB } from "@/lib/dbConnection";
import { Channel, Member, Profile, Server } from "@/lib/modals/modals";
import { userProfile } from "@/lib/userProfile";
import { ServerType } from "@/types";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const ServerIdLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { serverId: string };
}) => {
  const profile = await userProfile();
  if (!profile) redirect("/sign-in");

  let server: ServerType | null = null;
  try {
    connectToDB();
    server = await Server.findById(params.serverId)
      .populate({
        path: "members",
        model: Member,
        populate: {
          path: "profileId",
          model: Profile,
          select: "_id name imageUrl email",
        },
        options: { sort: { role: 1 } },
      })
      .populate({
        path: "channels",
        model: Channel,
        options: { sort: { createdAt: 1 } },
      })
      .exec();
  } catch (error: any) {
    console.log("Error while fetching server : ", error.message);
  } finally {
    if (!server) return redirect("/");
  }

  return (
    <div className="h-full">
      <div className="hidden md:flex flex-col h-full w-60 fixed z-20 inset-y-0">
        <ServerSidebar
          _server={JSON.stringify(server)}
          profileId={profile?._id?.toString()}
        />
      </div>
      <main className="h-full md:pl-60">{children}</main>
    </div>
  );
};

export default ServerIdLayout;
