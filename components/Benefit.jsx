import React from 'react'
import Image from "next/image";

// title: "Contracts to ensure peace of mind.",
//         caption:
//           "Every transaction of a service includes a contract to make sure you recieve the product you have paid for. No more Instagram scams!",
//       };

const Benefit = ({ icon, title, caption, background="bg-slate-900", style }) => {
      
  return (
    <section className={`relative px-8 ${background} lg:h-[250px] lg:flex flex-center lg:mx-10 py-10 lg:border border-secondary-100 lg:rounded-xl ${style}`}>
            <Image 
            src={icon}
            width={800}
            height={800}
            className={`sm:hidden md:static`}
            ></Image>
        <div className="flex flex-col">
          <div className="">
            <h2 className="text-2xl font-bold z-50 mb-2">{title}</h2>
            <p>{caption}</p>
          </div>
            {/* <Image
                src={icon}
                width={300}
                height={300}
                className={`sm:hidden md:flex w-[150px] ${style}`}
            ></Image> */}
        </div>
      </section>
  )
}

export default Benefit
