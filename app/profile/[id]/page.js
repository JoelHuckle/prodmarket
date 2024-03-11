"use client";

import Post from "@/components/Post";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

function Profile() {
  const pathname = usePathname().replace("/profile/", "");
  console.log(pathname);

  return (
    <section>
      <section className="flex flex-col gap-7">
        <Post />
        <Post />
        <Post />
      </section>
    </section>
  );
}

export default Profile;
