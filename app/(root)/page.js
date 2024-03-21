import Image from "next/image";
import Search from "@/components/Search";
import Profile from "@/components/Profile";
import Checkmark from "@/components/ui/Checkmark";
import { Button } from "@/components/ui/button";
import Benefit from "@/components/Benefit";

const features = [
  {
    key: 1,
    title: "Find industry producers to collab with.",
    caption:
      "Search for producers and create connections, Search for producers and create connections.",
  },
  {
    key: 2,
    title: "Subscribe to loop emails.",
    caption:
      "Search for producers and create connections, Search for producers and create connections.",
  },
  {
    key: 3,
    title: "Buy from producers with peace of mind.",
    caption:
      "Search for producers and create connections, Search for producers and create connections.",
  },
];

const benefits = [
  {
    key: 1,
    title: "",
    caption: "",
    icon: "",
  },
  {
    key: 2,
    title: "",
    caption: "",
    icon: "",
  },
];

export default function Home() {
  return (
    <main>
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
      <section className="padding-container mb-10 sm:bg-gradient-to-t from-dark-100 to-dark-200 pb-10 lg:bg-gradient-to-r pt-8 ">
        <h1 className="text-3xl text-accent-100 font-bold mb-5 pt-10">
          Welcome to Prodmarket.
        </h1>
        <div className="flex flex-col md:flex-row md:gap-[100px] gap-5">
          <section>
            <h3 className="font-bold text-lg mb-4">Buying</h3>
            <div className="flex flex-col gap-5">
              {features.map((item) => (
                <li key={item.key} className="flex mr-3">
                  <Checkmark style="w-[50px]" />
                  <div className="relative left-2 lg:mr-24">
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
                <li key={item.key} className="flex mr-3">
                  <Checkmark style="w-[50px]" />
                  <div className="relative left-2 lg:mr-24">
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
      <section className="px-10 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 mr-auto">
          <div>
            <Benefit
              title="Contracts to ensure peace of mind"
              caption="Every transaction of a service includes a contract to make sure you recieve the product you have paid for. No more Instagram scams!"
              icon="/handshake.png"
            />
          </div>
          <div>
            <Benefit
              title="Market your services to a large "
              caption="Generate money through marketing to a large audience through multiple service types"
              icon="/home-money.png"
              background="sm:border-t sm:border-b lg:border"
            />
          </div>
          <div>
            <Benefit
              title="Market your services to a large "
              caption="Generate money through marketing to a large audience through multiple service types"
              icon="/home-money.png"
              background="sm:border-t lg:border"
            />
          </div>
        </div>
      </section>

      {/* cta */}
      <section className="padding-container lg:mx-40 py-12 grid grid-cols-1 md:grid-cols-2 lg:rounded-xl bg-gradient-to-br from-dark-100 to-cyan-700 via-dark-200">
        <div className="lg:items-baseline justify-center gap-5 flex flex-col items-start sm:mb-10 lg:mb-0">
          <h1 className="text-3xl font-bold text-accent-100">
            Join the ProdMarket Community.
          </h1>
          <h1 className="text-3xl font-bold text-accent-100">
            Build your Dreams.
          </h1>
          <div>
            <Button className="hover:bg-slate-100 grid grid-cols-1 bg-white text-dark-100">
              Join now
            </Button>
          </div>
        </div>
        <div className="h-[400px] w-[400px] overflow-hidden">
          <img
            src="/home-studio-mess.jpg"
            alt="studio"
            className="overflow-hidden"
          />
        </div>
      </section>
    </main>
  );
}
