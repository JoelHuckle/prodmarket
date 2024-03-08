import React from 'react'
import Image from "next/image";

// title: "Contracts to ensure peace of mind.",
//         caption:
//           "Every transaction of a service includes a contract to make sure you recieve the product you have paid for. No more Instagram scams!",
//       };

const Benefit = ({ icon, title, caption, background="bg-slate-900", style }) => {
      
  return (
    <section className={`padding-container ${background} relative md:flex`}>
            {/* <Image 
            src={icon}
            width={800}
            height={800}
            className={`absolute bottom-[20px] left-[75%] lg:left-[80%] rotate-[10deg] w-[150px] md:hidden hover:translate-y-[-10px] transition-all ${style}`}
            ></Image> */}
        <div className="flex justify-center">
          <div className="lg:w-[500px]">
            <h2 className="text-2xl font-bold pt-10 z-50 mb-2">{title}</h2>
            <p>{caption}</p>
          </div>
            <Image
                src={icon}
                width={300}
                height={300}
                className={`sm:hidden md:flex w-[150px] ${style}`}
            ></Image>
        </div>
      </section>
  )
}

export default Benefit
