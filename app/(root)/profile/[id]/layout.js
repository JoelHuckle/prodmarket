import { Button } from "@/components/ui/button";

function ProfileLayout({
  children,
  pfp = "/profile.png",
  banner = "/cover.png",
}) {
  return (
    <div>
      <section className="">
        <div className="overflow-hidden sm:h-[25vh] lg:h-[30vh]">
          <img src={banner} alt="banner" className="w-screen" />
        </div>
        <div className="padding-container flex flex-center flex-col gap-1 relative bottom-[40px]">
          <div className="h-[120px] w-[120px] mb-5">
            <img
              src={pfp}
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
      <main>{children}</main>
    </div>
  );
}

export default ProfileLayout;
