import Image from "next/image";
import Search from "../components/Search";
import Profile from "@/components/Profile";
import Checkmark from "@/components/ui/Checkmark";
import { Button } from "@/components/ui/button";
import Handshake from "../public/handshake.png";

const features = [
  {
    key: 1,
    title: "Find industry producers to collab with",
    caption: "Search for producers and create connections ",
  },
  {
    key: 2,
    title: "Subscribe to loop emails",
    caption: "caption",
  },
  {
    key: 3,
    title: "Buy from producers with peace of mind",
    caption: "caption",
  },
];

const contracts = {
  title: "Contracts to ensure peace of mind.",
  caption:
    "Every transaction of a service includes a contract to make sure you recieve the product you have paid for. No more instagram scams and failed promises!",
};

export default function Home() {
  return (
    <main className="">
      <Search />

      {/* trending profiles */}
      <section className="bg-slate-900 px-10 padding-container py-8">
        <h2 className="text-xl font-bold">Trending Producers</h2>
        <div className="relative top-3 right-[4px] flex gap-4 overflow-scroll">
          <Profile
            name="darkoivx"
            credits="yeat, ssg"
            thumbnail="https://i1.sndcdn.com/avatars-1H3QxDkTTtPzOz2v-3b9TCg-t240x240.jpg"
          />
          <Profile name="Amorii" credits="Yeat" />
          <Profile name="Mata" credits="Coochise" />
          <Profile name="Amorii" credits="Yeat" />
          <Profile name="Mata" credits="Coochise" />
          <Profile name="Amorii" credits="Yeat" />
        </div>
      </section>

      {/* features */}
      <section className="padding-container">
        <h1 className="text-3xl text-accent-100 font-bold mb-5 pt-10">
          Welcome to Prodmarket.
        </h1>
        <div className="flex flex-col md:flex-row md:gap-[100px] gap-5">
          <section>
            <h3 className="font-bold text-lg mb-4">Buying</h3>
            <div className="flex flex-col gap-5">
              {features.map((item) => (
                <li key={item.key} className="flex">
                  <Checkmark style="" />
                  <div className="ml-5">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-secondary-100 text-sm">{item.caption}</p>
                  </div>
                </li>
              ))}
            </div>
          </section>
          <section>
            <h3 className="font-bold text-lg mb-4">Selling</h3>
            <div className="flex flex-col gap-5">
              {features.map((item) => (
                <li key={item.key} className="flex">
                  <Checkmark style="" />
                  <div className="ml-5">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-secondary-100 text-sm">{item.caption}</p>
                  </div>
                </li>
              ))}
            </div>
          </section>
        </div>
        <Button
          variant="secondary"
          className="bg-accent-100 hover:bg-accent-200 text-primary px-5 mt-8"
        >
          Get Started
        </Button>
      </section>

      {/* benefits */}
      <section className="padding-container mt-10 bg-dark-200 h-[500px]">
        <img
          src="../public/handshake.png"
          className="absolute bottom-[350px] left-[70%] lg:left-[80%] rotate-[10deg] w-[200px]"
          alt="handshake"
        />
        <div className="flex flex-col gap-5">
          <h2 className="text-2xl font-bold pt-10 z-50">{contracts.title}</h2>
          <p>{contracts.caption}</p>
          <img src={Handshake} className="" alt="handshake" />
        </div>
      </section>
    </main>
  );
}
