import React from 'react'
import Image from "next/image";

// title: "Contracts to ensure peace of mind.",
//         caption:
//           "Every transaction of a service includes a contract to make sure you recieve the product you have paid for. No more Instagram scams!",
//       };

const Benefit = ({ icon, title, caption, background, style, iconStyle }) => {
      
  return (
    <section className={`relative px-1 ${background} lg:h-[250px] lg:flex flex-center flex-col text-center lg:mx-10 py-10 lg:border border-secondary-100 lg:rounded-xl ${style} shadow-white`}>
      <h2 className="text-xl font-bold z-50 mb-2">{title}</h2>
      <p className='text-secondary-100 lg:text-[16px]'>{caption}</p>
      <div className="sm:hidden md:flex">
        <img
          src={icon}
          alt={title}
          className={`absolute sm:w-[110px] lg:w-[130px] rotate-12 sm:bottom-[50%] lg:bottom-[150px] sm:left-[75%] lg:left-[70%] hover:-translate-y-3 transition-all duration-300 ${iconStyle}`}
        />
      </div>
    </section>
  );
}

export default Benefit
