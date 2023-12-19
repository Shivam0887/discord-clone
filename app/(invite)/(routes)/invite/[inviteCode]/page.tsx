import { connectToDB } from "@/lib/dbConnection";
import { Member, Profile, Server } from "@/lib/modals/modals";
import { userProfile } from "@/lib/userProfile";
import { redirectToSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";

const InviteCodePage = async ({
  params,
}: {
  params: { inviteCode: string };
}) => {
  const profile = await userProfile();
  if (!profile) return redirectToSignIn();

  if (!params.inviteCode) return redirect("/");

  connectToDB();
  const server = await Server.findOne(
    { inviteCode: params.inviteCode },
    { members: 1 }
  )
    .populate({
      path: "members",
      model: Member,
      match: { profileId: profile?._id },
    })
    .exec();

  if (server?.members?.length) return redirect(`/server/${server?._id}`);

  const newMember = await Member.create({
    profileId: profile?._id,
    serverId: server?._id,
  });

  const updatedServer = await Server.findOneAndUpdate(
    { inviteCode: params.inviteCode },
    {
      $push: {
        members: newMember?._id,
      },
    }
  );

  if (!updatedServer?.name) {
    await Member.findByIdAndDelete(newMember?._id);
    return (
      <div
        className="w-full h-screen flex flex-col justify-center items-center
      font-bold text-lg text-zinc-600 dark:text-zinc-200"
      >
        <h1>Invalid invite code</h1>
        <Link href="/" className="mt-2 ">
          <span className="bg-emerald-500 py-1 px-4 rounded-md">Go</span> Home
        </Link>
      </div>
    );
  }

  await Profile.findByIdAndUpdate(profile?._id, {
    $push: {
      server: updatedServer?._id,
      members: newMember?._id,
    },
  });

  return redirect(`/server/${updatedServer?._id}`);
};

export default InviteCodePage;
