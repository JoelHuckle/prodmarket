import Service from "@/components/Service";
import Link from "next/link";

const services = () => {
  const id = ":id";

  return (
    <main className="lg:px-4">
      <div className="flex gap-5 flex-center font-semibold text-sm text-center mt-6 relative bottom-[40px] border-b border-secondary-200 pb-3">
        <Link href={`/profile/${id}`}>Feed</Link>
        <Link href={`/profile/${id}/services`} className="underline">
          Services
        </Link>
      </div>
      <section className="flex sm:flex-col lg:flex-row flex-center gap-10 flex-wrap mb-20">
        <Service />
        <Service />
        <Service />
      </section>
    </main>
  );
};

export default services;
