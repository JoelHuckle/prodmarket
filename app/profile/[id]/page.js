"use client";

import Post from "@/components/Post";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

function Profile() {
  const pathname = usePathname().replace("/profile/", "");
  console.log(pathname);

  return (
    <section>
      <section>
        <div className="overflow-hidden sm:h-[25vh] lg:h-[30vh]">
          <img src="/home-shoes.jpg" alt="banner" className="w-screen" />
        </div>
        <div className="padding-container flex flex-center flex-col gap-1 relative bottom-[40px]">
          <div className="h-[120px] w-[120px] mb-5">
            <img
              src="/blank-pfp.jpg"
              alt="profile"
              className="border border-secondary-200 rounded-xl"
            />
          </div>
          <div className="text-center mb-3">
            <h1 className="text-2xl font-semibold">Darkoivx</h1>
            <p className="text-xs text-secondary-100">
              YEAT, KEN CARSON, PLAYBOI CARTI
            </p>
          </div>
          <Button className="bg-white text-dark-100 font-semibold w-[160px]">
            Follow
          </Button>
        </div>
      </section>
      <section className="flex flex-col gap-7">
        <Post />
        <Post />
        <Post />
      </section>
    </section>
  );
}

export default Profile;
