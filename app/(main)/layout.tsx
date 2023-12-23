import SideNavBar from "@/components/Navigation/SideNavBar";
import { connectToDB } from "@/lib/dbConnection";
import { Profile, Server } from "@/lib/modals/modals";
import { userProfile } from "@/lib/userProfile";
import { ServerType } from "@/types";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const profile = await userProfile();

  if (!profile) return redirect("/sign-in");

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
  } catch (error: any) {
    console.log("Failed to fetch servers ", error.message);
  }

  return (
    <div className="h-full">
      <div className="hidden md:flex flex-col h-full w-[72px] fixed z-30 inset-y-0 ">
        <SideNavBar _servers={JSON.stringify(servers)} />
      </div>
      <main className="h-full md:pl-[72px]">{children}</main>
    </div>
  );
};

export default MainLayout;
