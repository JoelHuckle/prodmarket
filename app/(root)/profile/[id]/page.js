import Post from "@/components/Post";
import Link from "next/link";

function Profile() {
  const id = ":id";

  return (
    <section>
      <div className="flex gap-5 flex-center font-semibold text-sm text-center mt-6 relative bottom-[40px] border-b border-secondary-200 pb-3">
        <Link href={`/profile/${id}`} className="underline">
          Feed
        </Link>
        <Link href={`/profile/${id}/services`}>Services</Link>
      </div>
      <section className="flex flex-center flex-col gap-7">
        <Post />
        <Post />
        <Post />
      </section>
    </section>
  );
}

export default Profile;
