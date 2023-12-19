"use client";

import { UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const ManageProfile = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <UserButton
      afterSignOutUrl="/sign-in"
      appearance={{
        elements: {
          avatarBox: "h-[35px] w-[35px]",
        },
      }}
    />
  );
};

export default ManageProfile;
