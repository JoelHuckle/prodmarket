import Profile from "@/components/Profile";
import Post from "@/components/Post";
import Service from "@/components/Service";

const feed = ({ name = "user" }) => {
  return (
    <main className="padding-container">
      <div className="pt-5">
        <h1 className="text-3xl font-semibold text-accent-100">{`Welcome ${name}.`}</h1>
      </div>

      {/* FOLLOWING */}
      <section className="py-8">
        <h2 className="text-xl font-bold">Following</h2>
        <div className="relative top-3 right-[4px] flex gap-4 overflow-scroll">
          <Profile name="darkoivx" credits="yeat, ssg" />
          <Profile name="Amorii" credits="Yeat" />
          <Profile name="Mata" credits="Coochise" />
          <Profile name="Amorii" credits="Yeat" />
          <Profile name="Mata" credits="Coochise" />
          <Profile name="Amorii" credits="Yeat" />
        </div>
      </section>

      <div className="flex sm:flex-col lg:flex-row lg:gap-20">
        {/* POSTS */}
        <section className="py-8">
          <h2 className="text-xl font-bold">Recent posts</h2>
          <div className="relative top-3 right-[10px] flex flex-col gap-4">
            <Post icon="/blank-pfp.jpg" />
            <Post icon="/blank-pfp.jpg" />
          </div>
        </section>
        <section className="py-8">
          <h2 className="text-xl font-bold">Followed Services</h2>
          <div className="relative top-3 right-[10px] flex flex-col md:flex-row flex-wrap gap-4">
            <Service icon="/blank-pfp.jpg" />
            <Service icon="/blank-pfp.jpg" />
            <Service icon="/blank-pfp.jpg" />
          </div>
        </section>
      </div>
    </main>
  );
};

export default feed;
